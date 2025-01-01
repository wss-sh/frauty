function showWarningBanner(domain, score) {
    // Check if warning already exists
    if (document.getElementById('domain-trust-notification')) {
        return;
    }
    
    console.log('Showing warning banner for:', domain, score);  // Debug log
    
    // Create warning notification
    const notification = document.createElement('div');
    notification.id = 'domain-trust-notification';
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        border-radius: 12px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.15);
        padding: 24px;
        width: 400px;
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes popIn {
            from {
                transform: translate(-50%, -50%) scale(0.95);
                opacity: 0;
            }
            to {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
        }
        @keyframes fadeOut {
            from {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
            to {
                transform: translate(-50%, -50%) scale(0.95);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Add overlay
    const overlay = document.createElement('div');
    overlay.id = 'domain-trust-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 2147483646;
        animation: fadeIn 0.2s ease-out;
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
    `;

    // Prepare Trustpilot section if score exists and is from server
    let trustpilotSection = '';
    if (score.hasOwnProperty('trustpilot_score') && 
        typeof score.trustpilot_score === 'number' && 
        !isNaN(score.trustpilot_score) && 
        score.trustpilot_score < 5) { // Only show if score is poor
        trustpilotSection = `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <span style="color: #666;">Trustpilot Rating:</span>
                <span style="font-weight: 600; color: #d32f2f;">
                    ${(score.trustpilot_score / 10 * 5).toFixed(1)}/5
                </span>
            </div>
            <a href="https://www.trustpilot.com/review/${domain}" 
               target="_blank" 
               style="
                   display: inline-block;
                   color: #00b67a;
                   text-decoration: none;
                   font-size: 13px;
                   display: flex;
                   align-items: center;
                   gap: 6px;
               "
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0l2.5 7.5H22L16 12.5l2.5 7.5L12 16l-6.5 4 2.5-7.5L2 8h7.5L12 0z"/>
                </svg>
                View Trustpilot Reviews
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="opacity: 0.7;">
                    <path d="M5 3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7H5V5h7V3H5zm9 0v2h3.6l-9.8 9.8 1.4 1.4L19 6.4V10h2V3h-7z"/>
                </svg>
            </a>
        `;
    }
    
    // Update notification content
    notification.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="background: #d32f2f; color: white; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 24px; margin: 0 auto 16px;">!</div>
            <h2 style="margin: 0 0 8px; color: #d32f2f; font-size: 20px; font-weight: 600;">
                Warning: Potential Security Risk
            </h2>
            <p style="margin: 0; color: #666; font-size: 14px;">
                We've identified potential risks with this website
            </p>
        </div>
        <div style="background: #f8f8f8; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <div style="margin-bottom: ${trustpilotSection ? '12px' : '0'};">
                <div style="font-weight: 600; color: #333; margin-bottom: 4px;">
                    ${domain}
                </div>
                <div style="color: #666; font-size: 14px;">
                    ${trustpilotSection ? 'has received concerning customer reviews' : 'may pose security risks'}
                </div>
            </div>
            ${trustpilotSection}
        </div>
        <div style="text-align: center; color: #666; font-size: 13px; margin-bottom: 20px;">
            Exercise extreme caution before:
            <ul style="text-align: left; margin: 8px 0; padding-left: 20px;">
                <li>Making any purchases</li>
                <li>Entering payment information</li>
                <li>Sharing personal data</li>
            </ul>
        </div>
        <div style="display: flex; gap: 12px; justify-content: center;">
            <button id="proceed-anyway" style="
                padding: 8px 16px;
                border: 1px solid #d32f2f;
                background: white;
                color: #d32f2f;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                font-size: 14px;
            ">
                Proceed Anyway
            </button>
            <button id="leave-site" style="
                padding: 8px 16px;
                border: none;
                background: #d32f2f;
                color: white;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                font-size: 14px;
            ">
                Leave Site
            </button>
        </div>
    `;

    // Add elements to the page
    document.body.appendChild(overlay);
    document.body.appendChild(notification);

    // Add button functionality
    const proceedButton = document.getElementById('proceed-anyway');
    const leaveButton = document.getElementById('leave-site');

    if (proceedButton) {
        proceedButton.addEventListener('click', () => {
            notification.style.animation = 'fadeOut 0.2s ease-in forwards';
            overlay.style.opacity = '0';
            overlay.style.backdropFilter = 'none';
            overlay.style.webkitBackdropFilter = 'none';
            setTimeout(() => {
                notification.remove();
                overlay.remove();
            }, 200);
        });
    }

    if (leaveButton) {
        leaveButton.addEventListener('click', () => {
            window.history.back();
        });
    }
}

// Make it available globally
window.showWarningBanner = showWarningBanner; 