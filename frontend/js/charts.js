function drawChart(data) {
    const container = document.getElementById('chartContainer');
    container.innerHTML = `
        <h3 style="margin-top: 0;">Vue d'ensemble</h3>
        <div style="display: flex; gap: 20px; align-items: center;">
            <div style="flex: 1;">
                <canvas id="pieChart"></canvas>
            </div>
            <div style="flex: 1; text-align: center;">
                <div style="font-size: 60px; font-weight: bold; color: var(--info);">${data.rate}%</div>
                <div style="color: #666;">Taux global</div>
            </div>
        </div>
    `;
}