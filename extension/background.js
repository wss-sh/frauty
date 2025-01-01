const API_URL = 'https://api.frauty.com/score-domain';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds
let domainCache = {};
let shownWarnings = new Set(); // Track domains where warning was shown

// Listen for web navigation
chrome.webNavigation.onCommitted.addListener(async (details) => {
    // Only check main frame navigation (not iframes etc)
    if (details.frameId === 0) {
        const url = new URL(details.url);
        const domain = url.hostname;
        
        // Skip checking special URLs and empty domains
        if (!domain || 
            domain === 'newtab' || 
            domain.includes('chrome://') || 
            domain.includes('chrome-extension://') ||
            domain.includes('about:') ||
            domain === 'localhost') {
            return;
        }

        // Clear shown warnings for different domains
        if (!details.url.includes(domain)) {
            shownWarnings.clear();
        }

        await checkDomain(domain);
    }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'checkDomain') {
        // Prevent multiple responses by checking if we've already responded
        let hasResponded = false;
        
        checkDomain(request.domain).then(data => {
            if (!hasResponded) {
                hasResponded = true;
                if (data.status === 'error') {
                    sendResponse({ 
                        success: false, 
                        status: 'error',
                        scores: { 
                            is_error: true,
                            total_score: -1
                        }
                    });
                } else {
                    sendResponse({ success: true, data: data });
                }
            }
        }).catch(error => {
            if (!hasResponded) {
                hasResponded = true;
                sendResponse({ 
                    success: false, 
                    status: 'error',
                    scores: { 
                        is_error: true,
                        total_score: -1
                    }
                });
            }
        });
        return true; // Will respond asynchronously
    }
});

async function checkDomain(domain) {
    try {
        // Check cache first
        const cached = domainCache[domain];
        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
            updateIcon(cached.score, domain);
            if (!cached.score.is_trusted && cached.score.total_score < 3 && !cached.score.is_error) {
                showAlert(domain, cached.score);
            }
            return {
                domain: domain,
                scores: cached.score,
                status: 'success'
            };
        }

        // Make API request
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ domain })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Cache the result
        domainCache[domain] = {
            score: data.scores,
            timestamp: Date.now()
        };

        // Update extension icon based on score
        updateIcon(data.scores, domain);

        // Show alert for potentially unsafe domains
        if (!data.scores.is_trusted && data.scores.total_score < 3) {
            showAlert(domain, data.scores);
        }

        return data;

    } catch (error) {
        console.error('Error checking domain:', error);
        const isNetworkError = error.message.includes('Failed to fetch') || 
                             error.message.includes('NetworkError') ||
                             error.message.includes('Network request failed');
        
        const errorScore = { 
            total_score: -1, 
            is_error: true,
            is_network_error: isNetworkError 
        };
        
        // Update icon to error state but don't show any alerts
        updateIcon(errorScore, domain);
        
        // Return error state
        return {
            domain: domain,
            scores: errorScore,
            status: 'error',
            error: error.message
        };
    }
}

function updateIcon(scores, domain) {
    // Create canvas for dynamic icon
    const canvas = new OffscreenCanvas(128, 128);
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, 128, 128);
    
    // Create gradient background
    if (scores.total_score === -1) {
        // Grey gradient for error state
        const gradient = ctx.createLinearGradient(0, 0, 128, 128);
        gradient.addColorStop(0, '#6B7280');
        gradient.addColorStop(1, '#4B5563');
        ctx.fillStyle = gradient;
    } else if (scores.total_score >= 8) {
        // Green gradient for very safe
        const gradient = ctx.createLinearGradient(0, 0, 128, 128);
        gradient.addColorStop(0, '#10B981');
        gradient.addColorStop(1, '#059669');
        ctx.fillStyle = gradient;
    } else if (scores.total_score >= 6) {
        // Blue gradient for mostly safe
        const gradient = ctx.createLinearGradient(0, 0, 128, 128);
        gradient.addColorStop(0, '#0EA5E9');
        gradient.addColorStop(1, '#0284C7');
        ctx.fillStyle = gradient;
    } else if (scores.total_score >= 3) {
        // Yellow gradient for caution
        const gradient = ctx.createLinearGradient(0, 0, 128, 128);
        gradient.addColorStop(0, '#FBBF24');
        gradient.addColorStop(1, '#D97706');
        ctx.fillStyle = gradient;
    } else {
        // Red gradient for unsafe
        const gradient = ctx.createLinearGradient(0, 0, 128, 128);
        gradient.addColorStop(0, '#EF4444');
        gradient.addColorStop(1, '#DC2626');
        ctx.fillStyle = gradient;
    }
    
    // Draw rounded rectangle background
    ctx.beginPath();
    ctx.roundRect(0, 0, 128, 128, 16);
    ctx.fill();
    
    // Add shield icon
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(64, 24);
    ctx.lineTo(32, 40);
    ctx.lineTo(32, 72);
    ctx.quadraticCurveTo(32, 96, 64, 104);
    ctx.quadraticCurveTo(96, 96, 96, 72);
    ctx.lineTo(96, 40);
    ctx.closePath();
    ctx.stroke();
    
    // For error state, show a different icon
    if (scores.total_score === -1) {
        if (scores.is_network_error) {
            // Show disconnected icon for network errors
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 6;
            // Draw wifi-like symbol with X
            ctx.beginPath();
            ctx.arc(64, 64, 16, Math.PI, 0, true);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(64, 64, 24, Math.PI, 0, true);
            ctx.stroke();
            // Draw X
            ctx.beginPath();
            ctx.moveTo(54, 54);
            ctx.lineTo(74, 74);
            ctx.moveTo(74, 54);
            ctx.lineTo(54, 74);
            ctx.stroke();
        } else {
            // Show question mark for other errors
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('?', 64, 64);
        }
    } else if (scores.total_score < 3 && !scores.is_error) {
        // Show warning symbol for unsafe sites (only if not an error state)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', 64, 64);
    } else if (!scores.is_error) {
        // Show checkmark for safe sites (only if not an error state)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(48, 64);
        ctx.lineTo(56, 76);
        ctx.lineTo(80, 52);
        ctx.stroke();
    }
    
    // Scale down to 16x16 for the actual icon
    const finalCanvas = new OffscreenCanvas(16, 16);
    const finalCtx = finalCanvas.getContext('2d');
    finalCtx.imageSmoothingEnabled = true;
    finalCtx.imageSmoothingQuality = 'high';
    finalCtx.drawImage(canvas, 0, 0, 16, 16);

    chrome.action.setIcon({
        imageData: finalCtx.getImageData(0, 0, 16, 16)
    });

    // Only show warning banner for unsafe sites when we have a valid score and it's not an error state
    if (!scores.is_error && scores.total_score < 3) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0] && tabs[0].url && !tabs[0].url.startsWith('chrome://')) {
                const tabDomain = new URL(tabs[0].url).hostname;
                
                // Only show warning if not already shown for this domain
                if (!shownWarnings.has(tabDomain)) {
                    // Check if warning is already shown
                    chrome.scripting.executeScript({
                        target: {tabId: tabs[0].id},
                        func: () => document.getElementById('domain-trust-notification') !== null
                    }).then((result) => {
                        const warningExists = result[0]?.result;
                        if (!warningExists) {
                            chrome.scripting.executeScript({
                                target: {tabId: tabs[0].id},
                                files: ['warning.js']
                            }).then(() => {
                                setTimeout(() => {
                                    chrome.scripting.executeScript({
                                        target: {tabId: tabs[0].id},
                                        func: (domain, score) => {
                                            if (typeof window.showWarningBanner === 'function' && 
                                                !document.getElementById('domain-trust-notification')) {
                                                window.showWarningBanner(domain, score);
                                            }
                                        },
                                        args: [domain, scores]
                                    });
                                    // Mark warning as shown for this domain
                                    shownWarnings.add(tabDomain);
                                }, 100);
                            });
                        }
                    });
                }
            }
        });
    }
}

function showAlert(domain, scores) {
    const score = Math.round(scores.total_score * 10);
    let message = `Warning: ${domain} has a safety score of ${score}%.\n`;
    
    // Add specific warnings based on scores
    if (scores.ssl_score < 5) message += '\n• SSL security issues detected';
    if (scores.blacklist_score < 5) message += '\n• Domain appears on security blacklists';
    if (scores.domain_age_score < 2) message += '\n• Very new domain - exercise caution';
    if (scores.trustpilot_score < 4) message += '\n• Poor user trust ratings';

    chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon48.png'),
        title: 'Website Safety Alert',
        message: message,
        priority: 2,
        requireInteraction: true
    });
} 