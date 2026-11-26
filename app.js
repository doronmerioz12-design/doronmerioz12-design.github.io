// 1. מחלקת בסיס לאסטרטגיית תצוגה (Strategy Interface)
class DisplayStrategy {
    render(payload) {
        throw new Error("render() must be implemented by concrete strategy");
    }
}

// 2. אסטרטגיה להצגת תרשימי ארכיטקטורה (עם Fallback נקי אם התמונה טרם הועלתה)
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

// 3. אסטרטגיה להצגת גרפים ומדדי ביצועים
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

// 4. אסטרטגיה להצגת נקודות מפתח הנדסיות
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

// 5. מפת האסטרטגיות (Registry / Context)
const strategyRegistry = {
    ARCHITECTURE_DIAGRAM: new ArchitectureDiagramStrategy(),
    PERFORMANCE_GRAPH: new PerformanceGraphStrategy(),
    TEXT_HIGHLIGHTS: new TextHighlightsStrategy()
};

// טעינה ורינדור דינמי של הפרויקטים
async function loadProjects() {
    const container = document.getElementById('projects-container');
    try {
        const response = await fetch('projects.json');
        const projects = await response.json();

        container.innerHTML = projects.map(project => {
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
                    <a href="${project.githubUrl}" target="_blank" class="btn btn-outline" style="display:inline-block; margin-top:10px; font-size:0.9rem;">
                        View Repository →
                    </a>
                </article>
            `;
        }).join('');
    } catch (error) {
        container.innerHTML = `<p>Failed to load projects data.</p>`;
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', loadProjects);