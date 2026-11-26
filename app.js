let loadedProjects = [];

// 1. מחלקת בסיס לאסטרטגיית תצוגה
class DisplayStrategy {
    render(payload) {
        throw new Error("render() must be implemented by concrete strategy");
    }
}

class ArchitectureDiagramStrategy extends DisplayStrategy {
    render(payload) {
        return `
            <div class="strategy-box diagram-placeholder">
                <strong>System Architecture View</strong>
                <p>${payload.caption}</p>
                <img src="${payload.imagePath}" alt="${payload.caption}" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <p style="display:none; color:#38bdf8; margin-top:8px;">
                    [Diagram placeholder: add <code>${payload.imagePath}</code> to display visual schema]
                </p>
            </div>
        `;
    }
}

class PerformanceGraphStrategy extends DisplayStrategy {
    render(payload) {
        const barsHtml = payload.bars.map(bar => `
            <div class="bar-row">
                <div class="bar-label">
                    <span>${bar.label}</span>
                    <span>${bar.valueText}</span>
                </div>
                <div class="bar-track">
                    <div class="bar-fill" style="width: ${bar.percent}%;"></div>
                </div>
            </div>
        `).join('');

        return `
            <div class="strategy-box">
                <strong style="display:block; margin-bottom:10px;">${payload.metricTitle}</strong>
                ${barsHtml}
            </div>
        `;
    }
}

class TextHighlightsStrategy extends DisplayStrategy {
    render(payload) {
        const items = payload.highlights.map(item => `<li>${item}</li>`).join('');
        return `
            <div class="strategy-box">
                <ul style="padding-left: 20px; color: #cbd5e1;">${items}</ul>
            </div>
        `;
    }
}

const strategyRegistry = {
    ARCHITECTURE_DIAGRAM: new ArchitectureDiagramStrategy(),
    PERFORMANCE_GRAPH: new PerformanceGraphStrategy(),
    TEXT_HIGHLIGHTS: new TextHighlightsStrategy()
};

// טעינת הפרויקטים
async function loadProjects() {
    const container = document.getElementById('projects-container');
    try {
        const response = await fetch('projects.json?v=' + new Date().getTime());
        loadedProjects = await response.json();

        container.innerHTML = loadedProjects.map((project, index) => {
            const strategy = strategyRegistry[project.displayType] || new TextHighlightsStrategy();
            const dynamicContent = strategy.render(project.payload);
            const techBadges = project.tech.map(t => `<span class="tech-tag">${t}</span>`).join('');

            return `
                <article class="project-card">
                    <div class="project-header">
                        <h3>${project.title}</h3>
                        <span class="badge">${project.year} • ${project.displayType}</span>
                    </div>
                    <p>${project.description}</p>
                    <div class="tech-tags">${techBadges}</div>
                    ${dynamicContent}
                    <div class="card-actions">
                        <button onclick="openProjectModal(${index})" class="btn btn-sm">
                            Project Deep Dive & Architecture
                        </button>
                        <a href="${project.githubUrl}" target="_blank" class="btn btn-outline btn-sm">
                            GitHub Repository ↗
                        </a>
                    </div>
                </article>
            `;
        }).join('');
    } catch (error) {
        container.innerHTML = `<p>Failed to load projects data.</p>`;
        console.error(error);
    }
}

// פתיחת עמוד הפירוט באותו דף (Modal)
function openProjectModal(index) {
    const project = loadedProjects[index];
    if (!project || !project.deepDive) return;

    const strategy = strategyRegistry[project.displayType] || new TextHighlightsStrategy();
    const dynamicContent = strategy.render(project.payload);
    const techBadges = project.tech.map(t => `<span class="tech-tag">${t}</span>`).join('');
    const archList = project.deepDive.architecture.map(item => `<li>${item}</li>`).join('');

    document.getElementById('modal-body').innerHTML = `
        <h2 style="margin-top: 10px;">${project.title}</h2>
        <div class="tech-tags">${techBadges}</div>
        <p style="color: #cbd5e1; margin-top: 10px;">${project.description}</p>

        ${dynamicContent}

        <div class="modal-section">
            <h4>The Engineering Challenge</h4>
            <p style="color: #cbd5e1;">${project.deepDive.problem}</p>
        </div>

        <div class="modal-section">
            <h4>System Design & Implementation</h4>
            <ul>${archList}</ul>
        </div>

        <div class="modal-section">
            <h4>Key Engineering Takeaways</h4>
            <p style="color: #cbd5e1;">${project.deepDive.takeaways}</p>
        </div>

        <div style="margin-top: 25px;">
            <a href="${project.githubUrl}" target="_blank" class="btn">View Source Code on GitHub ↗</a>
        </div>
    `;

    document.getElementById('project-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
    document.getElementById('project-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function closeModalOnBackdrop(event) {
    if (event.target.id === 'project-modal') {
        closeProjectModal();
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProjectModal();
});

document.addEventListener('DOMContentLoaded', loadProjects);