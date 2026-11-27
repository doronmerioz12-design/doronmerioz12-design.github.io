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

function getProjectDeepDiveUrl(project) {
    const query = project.id
        ? `id=${encodeURIComponent(project.id)}`
        : `title=${encodeURIComponent(project.title)}`;
    return `project.html?${query}`;
}

// טעינת הפרויקטים
async function loadProjects() {
    const container = document.getElementById('projects-container');
    try {
        const response = await fetch('projects.json?v=' + new Date().getTime());
        loadedProjects = await response.json();

        container.innerHTML = loadedProjects.map((project) => {
            const strategy = strategyRegistry[project.displayType] || new TextHighlightsStrategy();
            const dynamicContent = strategy.render(project.payload);
            const techBadges = project.tech.map(t => `<span class="tech-tag">${t}</span>`).join('');
            const deepDiveUrl = getProjectDeepDiveUrl(project);

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
                        <a href="${deepDiveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm">
                            Project Deep Dive & Architecture ↗
                        </a>
                        <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">
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

document.addEventListener('DOMContentLoaded', loadProjects);