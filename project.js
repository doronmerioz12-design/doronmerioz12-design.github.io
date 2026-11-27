async function loadProjectDetail() {
    const container = document.getElementById('project-detail-container');
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');
    const projectTitle = params.get('title');

    if (!projectId && !projectTitle) {
        container.innerHTML = `
            <div class="card-section">
                <h2>Project not specified</h2>
                <a href="index.html" class="btn">Return Home</a>
            </div>
        `;
        return;
    }

    try {
        const response = await fetch('projects.json?v=' + new Date().getTime());
        const projects = await response.json();
        const project = projects.find(p =>
            (projectId && p.id === projectId) ||
            (projectTitle && p.title === projectTitle)
        );

        if (!project || !project.deepDive) {
            container.innerHTML = `
                <div class="card-section">
                    <h2>Deep Dive Not Available Yet</h2>
                    <p>Full documentation for this project is coming soon.</p>
                    <a href="index.html" class="btn">Return Home</a>
                </div>
            `;
            return;
        }

        document.title = `${project.title} | Deep Dive`;
        const dd = project.deepDive;
        const techBadges = project.tech.map(t => `<span class="tech-tag">${t}</span>`).join('');

        const componentsHtml = (dd.components || []).map(comp => `
            <div class="component-card">
                <h4>${comp.name}</h4>
                <span class="comp-role">${comp.role}</span>
                <p>${comp.details}</p>
            </div>
        `).join('');

        const algorithmsHtml = (dd.algorithms || []).map(alg => `
            <div class="algo-card">
                <div class="algo-header">
                    <h4>${alg.name}</h4>
                    <span class="badge">${alg.complexity}</span>
                </div>
                <p>${alg.explanation}</p>
                <ul>
                    ${(alg.steps || []).map(step => `<li>${step}</li>`).join('')}
                </ul>
            </div>
        `).join('');

        const runsHtml = (dd.terminalRuns || []).map(run => `
            <div class="run-showcase-card">
                <h4>${run.heading}</h4>

                <div class="cipher-flow-box">
                    <div class="text-stage">
                        <span class="stage-label">Original Plaintext (English)</span>
                        <code class="stage-text plaintext">${run.plaintext}</code>
                    </div>

                    <div class="cipher-arrow">
                        <div class="arrow-line"></div>
                        <div class="arrow-badge">
                            <strong>${run.cipherType}</strong>
                            <span>${run.cipherParam}</span>
                        </div>
                        <div class="arrow-head">▼</div>
                    </div>

                    <div class="text-stage">
                        <span class="stage-label">Intercepted Ciphertext</span>
                        <code class="stage-text ciphertext">${run.ciphertext}</code>
                    </div>
                </div>

                <div class="terminal-capture">
                    <span class="stage-label">Live Terminal Execution</span>
                    <img src="${run.screenshotPath}" alt="${run.heading}"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <div class="missing-img-note" style="display:none;">
                        Save your terminal screenshot as <code>${run.screenshotPath}</code> to display it here.
                    </div>
                </div>
            </div>
        `).join('');

        const pipelineHtml = (dd.pipelineStages || []).map((stage, idx) => `
            <div class="pipeline-step">
                <span class="step-num">0${idx + 1}</span>
                <strong>${stage.title}</strong>
                <p>${stage.desc}</p>
            </div>
        `).join('');

        const aiHighlightsHtml = dd.aiIntegration && Array.isArray(dd.aiIntegration.highlights)
            ? `<ul class="styled-list">${dd.aiIntegration.highlights.map(item => `<li>${item}</li>`).join('')}</ul>`
            : '';

        container.innerHTML = `
            <header class="project-hero">
                <span class="badge">${project.year} • System Architecture Deep Dive</span>
                <h1>${project.title}</h1>
                <p class="project-lead">${project.description}</p>
                <div class="tech-tags">${techBadges}</div>
                <div class="card-actions" style="margin-top: 20px;">
                    <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn">View Source Code on GitHub ↗</a>
                </div>
            </header>

            ${dd.overview ? `
                <section class="card-section">
                    <h2>1. Project Overview & Motivation</h2>
                    <p>${dd.overview}</p>
                </section>
            ` : ''}

            ${dd.architectureSummary || pipelineHtml ? `
                <section class="card-section">
                    <h2>2. System Architecture & Flow</h2>
                    ${dd.architectureSummary ? `<p>${dd.architectureSummary}</p>` : ''}
                    ${pipelineHtml ? `<div class="arch-pipeline">${pipelineHtml}</div>` : ''}
                    ${project.payload && project.payload.imagePath ? `
                        <div class="strategy-box diagram-placeholder" style="margin-top: 20px;">
                            <strong>${project.payload.caption}</strong>
                            <img src="${project.payload.imagePath}" alt="${project.payload.caption}"
                                 onerror="this.style.display='none';">
                        </div>
                    ` : ''}
                </section>
            ` : ''}

            ${componentsHtml ? `
                <section class="card-section">
                    <h2>3. Core Components</h2>
                    <div class="components-grid">${componentsHtml}</div>
                </section>
            ` : ''}

            ${dd.aiIntegration ? `
                <section class="card-section">
                    <h2>4. Gemini AI Integration & Fault Tolerance</h2>
                    <p>${dd.aiIntegration.overview || ''}</p>
                    ${aiHighlightsHtml}
                </section>
            ` : ''}

            ${algorithmsHtml ? `
                <section class="card-section">
                    <h2>5. Cryptanalysis Algorithms</h2>
                    <div class="algo-grid">${algorithmsHtml}</div>
                </section>
            ` : ''}

            ${runsHtml ? `
                <section class="card-section">
                    <h2>6. Live Terminal Runs & Cipher Walkthroughs</h2>
                    <p class="section-note">End-to-end execution traces showing plaintext transformation, cipher parameters, and automated pipeline decryption.</p>
                    ${runsHtml}
                </section>
            ` : ''}
        `;
    } catch (err) {
        container.innerHTML = `<p>Error loading project details.</p>`;
        console.error(err);
    }
}

document.addEventListener('DOMContentLoaded', loadProjectDetail);