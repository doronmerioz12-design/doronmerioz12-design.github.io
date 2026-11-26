// פתיחת עמוד הפירוט באותו דף (Modal)
function openProjectModal(index) {
    const project = loadedProjects[index];
    if (!project) return;

    const strategy = strategyRegistry[project.displayType] || new TextHighlightsStrategy();
    const dynamicContent = strategy.render(project.payload);
    const techBadges = project.tech.map(t => `<span class="tech-tag">${t}</span>`).join('');
    const deepDive = project.deepDive;

    const deepDiveHtml = deepDive ? `
        ${deepDive.intuitiveOverview ? `
            <div class="modal-section">
                <h4>Intuitive Overview</h4>
                <p style="color: #cbd5e1;">${deepDive.intuitiveOverview}</p>
            </div>
        ` : ''}

        ${deepDive.executionProof ? `
            <div class="modal-section">
                <h4>${deepDive.executionProof.title}</h4>
                <p style="color: #cbd5e1; margin-bottom: 12px;">${deepDive.executionProof.caption}</p>
                <div class="proof-box">
                    <img src="${deepDive.executionProof.imagePath}" alt="${deepDive.executionProof.title}"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <p style="display:none; color:#38bdf8; font-size:0.9rem;">
                        [Screenshot ready: save your execution capture as <code>${deepDive.executionProof.imagePath}</code>]
                    </p>
                </div>
            </div>
        ` : ''}

        <div class="modal-section">
            <h4>The Engineering Challenge</h4>
            <p style="color: #cbd5e1;">${deepDive.problem}</p>
        </div>

        <div class="modal-section">
            <h4>System Design & Implementation</h4>
            <ul>${deepDive.architecture.map(item => `<li>${item}</li>`).join('')}</ul>
        </div>

        <div class="modal-section">
            <h4>Key Engineering Takeaways</h4>
            <p style="color: #cbd5e1;">${deepDive.takeaways}</p>
        </div>
    ` : `
        <div class="modal-section">
            <h4>Architecture & Implementation</h4>
            <p style="color: #cbd5e1;">Full architectural breakdown and benchmarks are documented in the GitHub repository README.</p>
        </div>
    `;

    document.getElementById('modal-body').innerHTML = `
        <h2 style="margin-top: 10px;">${project.title}</h2>
        <div class="tech-tags">${techBadges}</div>
        <p style="color: #cbd5e1; margin-top: 10px;">${project.description}</p>

        ${dynamicContent}
        ${deepDiveHtml}

        <div style="margin-top: 25px;">
            <a href="${project.githubUrl}" target="_blank" class="btn">View Source Code on GitHub ↗</a>
        </div>
    `;

    document.getElementById('project-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}