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
    if (!container) return;

    try {
        const response = await fetch('projects.json?v=' + new Date().getTime());
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const rawData = await response.json();
        const projectsArray = Array.isArray(rawData)
            ? rawData
            : Array.isArray(rawData?.projects)
                ? rawData.projects
                : [];

        loadedProjects = projectsArray;

        if (!loadedProjects.length) {
            container.innerHTML = `<p>No projects found.</p>`;
            return;
        }

        container.innerHTML = loadedProjects.map((project) => {
            const displayType = project.displayType || 'TEXT_HIGHLIGHTS';
            const strategy = strategyRegistry[displayType] || new TextHighlightsStrategy();

            const payload = project.payload || {
                caption: project.subtitle || project.title,
                imagePath: project.architecture?.diagramPath || '',
                highlights: project.highlights || []
            };

            const dynamicContent = strategy.render(payload);
            const techList = Array.isArray(project.tech)
                ? project.tech
                : Array.isArray(project.techStack)
                    ? project.techStack
                    : [];
            const techBadges = techList.map(t => `<span class="tech-tag">${t}</span>`).join('');
            const deepDiveUrl = getProjectDeepDiveUrl(project);
            const badgeText = project.year
                ? `${project.year} • ${displayType}`
                : (project.status || displayType);
            const description = project.description || project.subtitle || '';
            const githubButton = project.githubUrl
                ? `<a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">
                       GitHub Repository ↗
                   </a>`
                : '';

            return `
                <article class="project-card">
                    <div class="project-header">
                        <h3>${project.title}</h3>
                        <span class="badge">${badgeText}</span>
                    </div>
                    <p>${description}</p>
                    <div class="tech-tags">${techBadges}</div>
                    ${dynamicContent}
                    <div class="card-actions">
                        <a href="${deepDiveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm">
                            Project Deep Dive & Architecture ↗
                        </a>
                        ${githubButton}
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