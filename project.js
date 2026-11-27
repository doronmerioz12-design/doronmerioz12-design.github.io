async function loadProjectDetail() {
    const container = document.getElementById('project-detail-container');
    if (!container) return;

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
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const rawData = await response.json();
        const projects = Array.isArray(rawData)
            ? rawData
            : Array.isArray(rawData?.projects)
                ? rawData.projects
                : [];

        const project = projects.find(p =>
            (projectId && p.id === projectId) ||
            (projectTitle && p.title === projectTitle)
        );

        if (!project) {
            container.innerHTML = `
                <div class="card-section">
                    <h2>Project Not Found</h2>
                    <p>Could not find the requested project.</p>
                    <a href="index.html" class="btn">Return Home</a>
                </div>
            `;
            return;
        }

        document.title = `${project.title} | Deep Dive`;

        if (project.id === 'ultra') {
            const bgImage = encodeURI('assets/enigma backgorund image.webp');
            document.body.style.backgroundImage = `
                linear-gradient(rgba(10, 15, 28, 0.85), rgba(10, 15, 28, 0.92)),
                url("${bgImage}")
            `;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundAttachment = 'fixed';
        } else {
            document.body.style.backgroundImage = '';
            document.body.style.backgroundSize = '';
            document.body.style.backgroundPosition = '';
            document.body.style.backgroundAttachment = '';
        }

        const dd = project.deepDive || {};
        const arch = project.architecture || {};

        const techList = Array.isArray(project.tech)
            ? project.tech
            : Array.isArray(project.techStack)
                ? project.techStack
                : [];
        const techBadges = techList.map(t => `<span class="tech-tag">${t}</span>`).join('');

        const description = project.description || project.subtitle || '';
        const badgeLabel = project.year
            ? `${project.year} • System Architecture Deep Dive`
            : `${project.status || 'Project'} • System Architecture Deep Dive`;

        const githubActionHtml = project.githubUrl
            ? `<div class="card-actions" style="margin-top: 20px;">
                   <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn">View Source Code on GitHub ↗</a>
               </div>`
            : '';

        const rawComponents = Array.isArray(dd.components) && dd.components.length
            ? dd.components
            : Array.isArray(arch.components)
                ? arch.components
                : [];

        const componentsHtml = rawComponents.map(comp => `
            <div class="component-card">
                <h4>${comp.name}</h4>
                ${comp.role ? `<span class="comp-role">${comp.role}</span>` : ''}
                ${comp.details ? `<p>${comp.details}</p>` : ''}
            </div>
        `).join('');

        const algorithmsHtml = (dd.algorithms || []).map(alg => `
            <div class="algo-card">
                <div class="algo-header">
                    <h4>${alg.name}</h4>
                    ${alg.complexity ? `<span class="badge">${alg.complexity}</span>` : ''}
                </div>
                <p>${alg.explanation || ''}</p>
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

                ${run.routingResult ? `
                    <p class="routing-summary"><strong>Pipeline Routing & Status:</strong> <code>${run.routingResult}</code></p>
                ` : ''}

                <div class="terminal-capture">
                    <span class="stage-label">Live Terminal Execution</span>
                    <img src="${encodeURI(run.screenshotPath)}" alt="${run.heading}"
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

        const diagramPath = arch.diagramPath || project.payload?.imagePath || '';
        const diagramCaption = arch.diagramCaption || project.payload?.caption || `${project.title} — System Architecture`;

        const highlightsHtml = Array.isArray(project.highlights) && project.highlights.length
            ? `<ul class="styled-list">${project.highlights.map(item => `<li>${item}</li>`).join('')}</ul>`
            : '';

        const aiHighlightsHtml = dd.aiIntegration && Array.isArray(dd.aiIntegration.highlights)
            ? `<ul class="styled-list">${dd.aiIntegration.highlights.map(item => `<li>${item}</li>`).join('')}</ul>`
            : '';

        container.innerHTML = `
            <header class="project-hero">
                <span class="badge">${badgeLabel}</span>
                <h1>${project.title}</h1>
                <p class="project-lead">${description}</p>
                <div class="tech-tags">${techBadges}</div>
                ${githubActionHtml}
            </header>

            ${dd.overview || highlightsHtml ? `
                <section class="card-section">
                    <h2>1. Project Overview & Key Highlights</h2>
                    ${dd.overview ? `<p>${dd.overview}</p>` : ''}
                    ${highlightsHtml}
                </section>
            ` : ''}

            ${dd.architectureSummary || pipelineHtml || diagramPath ? `
                <section class="card-section">
                    <h2>2. System Architecture & Flow</h2>
                    ${dd.architectureSummary ? `<p>${dd.architectureSummary}</p>` : ''}
                    ${pipelineHtml ? `<div class="arch-pipeline">${pipelineHtml}</div>` : ''}
                    ${diagramPath ? `
                        <div class="strategy-box diagram-placeholder" style="margin-top: 20px;">
                            <strong>${diagramCaption}</strong>
                            <img src="${encodeURI(diagramPath)}" alt="${diagramCaption}"
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                            <p style="display:none; color:#38bdf8; margin-top:8px;">
                                [Diagram missing: verify <code>${diagramPath}</code>]
                            </p>
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
        console.error('loadProjectDetail failed:', err);
    }
}

document.addEventListener('DOMContentLoaded', loadProjectDetail);