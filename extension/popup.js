document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.url) return;

        const url = new URL(tab.url);
        const domain = url.hostname.replace('www.', '');
        
        // Handle special URLs
        if (!domain || 
            domain === 'newtab' || 
            domain.includes('chrome://') || 
            domain.includes('chrome-extension://') ||
            domain.includes('about:')) {
            document.getElementById('domain').textContent = 'System Page';
            document.getElementById('total-score').textContent = '-';
            document.getElementById('dns-score').textContent = '-';
            document.getElementById('ssl-score').textContent = '-';
            document.getElementById('blacklist-score').textContent = '-';
            document.getElementById('age-score').textContent = '-';
            document.getElementById('trustpilot-score').textContent = '-';
            return;
        }
        
        document.getElementById('domain').textContent = domain;

        // Helper function to safely format scores
        const formatScore = (score) => {
            if (typeof score !== 'number' || isNaN(score)) return '-';
            return `${Math.round(score * 10)}%`;
        };

        // Function to get score color
        const getScoreColor = (score) => {
            if (typeof score !== 'number' || isNaN(score)) return '#666';
            const percentage = score * 10;
            if (percentage >= 80) return '#10B981';
            if (percentage >= 60) return '#0EA5E9';
            if (percentage >= 30) return '#EAB308';
            return '#EF4444';
        };

        // Function to update circular progress
        const updateProgress = (score, isError = false) => {
            const circle = document.getElementById('score-progress');
            const radius = 54;
            const circumference = radius * 2 * Math.PI;
            
            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            
            if (isError || typeof score !== 'number' || isNaN(score)) {
                circle.style.strokeDashoffset = circumference;
                circle.style.stroke = '#6B7280'; // Grey for error state
                return;
            }
            
            const percentage = score * 10;
            const offset = circumference - (percentage / 100) * circumference;
            circle.style.strokeDashoffset = offset;
            circle.style.stroke = getScoreColor(score);
            
            // Add animation
            circle.style.transition = 'stroke-dashoffset 0.8s ease-in-out, stroke 0.5s ease-in-out';
        };

        // Function to update all scores in the UI
        const updateScores = (scores) => {
            const totalScoreElement = document.getElementById('total-score');
            
            if (scores.is_error) {
                totalScoreElement.textContent = 'Error';
                updateProgress(null, true);
                
                // Show network error message
                const warningElement = document.getElementById('warning');
                warningElement.innerHTML = `
                    <div class="error-message" style="padding: 12px; background: rgba(107, 114, 128, 0.1); border: 1px solid rgba(107, 114, 128, 0.2); border-radius: 8px; margin-top: 16px;">
                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                            </svg>
                            <span style="color: #6B7280; font-weight: 500;">Service Unavailable</span>
                        </div>
                        <p style="color: #6B7280; margin: 0;">Unable to reach Frauty servers at the moment. Please try again later.</p>
                    </div>`;
                
                // Set all scores to error state
                ['dns-score', 'ssl-score', 'blacklist-score', 'age-score', 'trustpilot-score'].forEach(id => {
                    const element = document.getElementById(id);
                    element.textContent = '-';
                    element.style.color = '#6B7280';
                });
                
                return;
            }
            
            totalScoreElement.textContent = formatScore(scores.total_score);
            updateProgress(scores.total_score);

            // Add trusted label if applicable
            if (scores.is_trusted) {
                document.getElementById('domain').textContent = `${domain} (Trusted Domain)`;
            }

            // Update individual scores with animation
            const updateWithAnimation = (elementId, score) => {
                const element = document.getElementById(elementId);
                element.style.opacity = '0';
                element.textContent = formatScore(score);
                element.style.color = getScoreColor(score);
                setTimeout(() => {
                    element.style.transition = 'opacity 0.3s ease-in-out';
                    element.style.opacity = '1';
                }, 100);
            };

            updateWithAnimation('dns-score', scores.dns_score);
            updateWithAnimation('ssl-score', scores.ssl_score);
            updateWithAnimation('blacklist-score', scores.blacklist_score);
            updateWithAnimation('age-score', scores.domain_age_score);
            updateWithAnimation('trustpilot-score', scores.trustpilot_score);

            // Show warnings if needed
            if (!scores.is_trusted && scores.total_score < 3) {
                const warnings = [];
                if (scores.ssl_score < 3) warnings.push('SSL security issues detected');
                if (scores.blacklist_score < 3) warnings.push('Domain appears on security blacklists');
                if (scores.domain_age_score < 2) warnings.push('Very new domain - exercise caution');
                if (scores.trustpilot_score < 3) warnings.push('Poor user trust ratings');

                if (warnings.length > 0) {
                    const warningElement = document.getElementById('warning');
                    warningElement.innerHTML = warnings.map((w, i) => 
                        `<div class="warning-item" style="animation-delay: ${i * 0.1}s">
                            <span class="warning-icon">!</span>${w}
                        </div>`
                    ).join('');
                }
            }
        };

        // Get data from background script instead of making direct API call
        const response = await chrome.runtime.sendMessage({
            action: 'checkDomain',
            domain: domain
        });

        if (!response.success || response.status === 'error') {
            updateScores(response.scores || { is_error: true, total_score: -1 });
        } else if (response.data && response.data.scores) {
            updateScores(response.data.scores);
        } else {
            updateScores({ is_error: true, total_score: -1 });
        }

    } catch (error) {
        console.error('Error fetching domain score:', error);
        updateScores({ is_error: true });
    }
}); 