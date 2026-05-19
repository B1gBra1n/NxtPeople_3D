const gData = {
    nodes: [
        // Users & External
        { id: "Candidates", group: "user", description: "Job seekers in the market." },
        { id: "Clients", group: "user", description: "Companies needing staff." },
        
        // Phase 1: Search & Attract
        { id: "NxtCampaign", group: "product", description: "Automated recruitment marketing." },
        { id: "NxtJob", group: "product", description: "AI job description & multiposting." },
        { id: "NxtForm", group: "product", description: "Mobile application & data intake." },
        
        // Data Phase 1
        { id: "Vacancies", group: "entity", description: "Active job openings." },
        { id: "Candidate Profiles", group: "entity", description: "Rich data collected from forms." },
        
        // Phase 2: Match
        { id: "NxtMatch", group: "product", description: "AI Screening and Shortlisting." },
        
        // Data Phase 2
        { id: "Shortlists", group: "entity", description: "Ranked candidates for jobs." },
        
        // Phase 3: Plan & Place
        { id: "NxtPlan", group: "product", description: "Shift scheduling & workforce management." },
        
        // Data Phase 3
        { id: "Timesheets", group: "entity", description: "Logged hours and shifts." },
        
        // Phase 4: Pay
        { id: "NxtPay", group: "product", description: "Payroll and invoicing." },
        
        // Overarching
        { id: "NxtInsight", group: "product", description: "Real-time analytics and BI dashboards." }
    ],
    links: [
        // Attract
        { source: "Clients", target: "NxtJob", description: "Provides job requirements" },
        { source: "NxtJob", target: "Vacancies", description: "Creates" },
        { source: "NxtCampaign", target: "Candidates", description: "Targets" },
        { source: "Candidates", target: "NxtForm", description: "Applies via" },
        { source: "NxtForm", target: "Candidate Profiles", description: "Generates" },
        
        // Match
        { source: "Vacancies", target: "NxtMatch", description: "Requires matching" },
        { source: "Candidate Profiles", target: "NxtMatch", description: "Processed by AI" },
        { source: "NxtMatch", target: "Shortlists", description: "Produces" },
        
        // Plan
        { source: "Shortlists", target: "NxtPlan", description: "Assigned to shifts" },
        { source: "NxtPlan", target: "Timesheets", description: "Generates approved hours" },
        
        // Pay
        { source: "Timesheets", target: "NxtPay", description: "Processed for payroll" },
        
        // Insight (connected to major products)
        { source: "NxtMatch", target: "NxtInsight", description: "Matching Analytics" },
        { source: "NxtPlan", target: "NxtInsight", description: "Labor Analytics" },
        { source: "NxtPay", target: "NxtInsight", description: "Financial Analytics" }
    ]
};

const getColor = (group) => {
    switch(group) {
        case 'product': return '#00f2fe'; // Cyber Blue
        case 'user': return '#f72585';    // Neon Pink
        case 'entity': return '#00f5d4';  // Mint Green
        default: return '#ffffff';
    }
};

const elem = document.getElementById('3d-graph');
const infoPanel = document.getElementById('node-info');

const Graph = ForceGraph3D()(elem)
    .graphData(gData)
    .dagMode('lr') // Left-to-Right structured architecture!
    .dagLevelDistance(80)
    .nodeColor(node => getColor(node.group))
    .linkDirectionalParticles(3)
    .linkDirectionalParticleWidth(1.5)
    .linkDirectionalParticleSpeed(0.005)
    .linkDirectionalArrowLength(3.5)
    .linkDirectionalArrowRelPos(1)
    .linkColor(() => 'rgba(255, 255, 255, 0.15)')
    .linkWidth(1)
    .onNodeHover(node => {
        elem.style.cursor = node ? 'pointer' : null;
        if (node) {
            infoPanel.innerHTML = `
                <h2>${node.id}</h2>
                <p class="desc">${node.description}</p>
                <div class="tags">
                    <span class="tag" style="border-color: ${getColor(node.group)}">${node.group.toUpperCase()}</span>
                </div>
            `;
        } else {
            infoPanel.innerHTML = '<p class="placeholder-text">Hover over a node to view its connection details.</p>';
        }
    })
    .onNodeClick(node => {
        const distance = 120;
        const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
        Graph.cameraPosition(
            { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
            node, 2000
        );
    });

// Spread nodes out nicely
Graph.d3Force('charge').strength(-400);

// Premium Node 3D Objects (Glowing Core + Wireframe Shield)
Graph.nodeThreeObject(node => {
    const group = new THREE.Group();
    const color = getColor(node.group);
    
    // Inner solid core
    const coreGeo = new THREE.SphereGeometry(4, 16, 16);
    const coreMat = new THREE.MeshLambertMaterial({ 
        color: color, 
        transparent: true, 
        opacity: 0.9 
    });
    group.add(new THREE.Mesh(coreGeo, coreMat));

    // Outer architectural wireframe
    const outerGeo = new THREE.IcosahedronGeometry(7, 0);
    const outerMat = new THREE.MeshBasicMaterial({ 
        color: color, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.25 
    });
    group.add(new THREE.Mesh(outerGeo, outerMat));

    // Text label
    const sprite = new SpriteText(node.id);
    sprite.color = '#ffffff';
    sprite.textHeight = 4.5;
    sprite.position.y = -12; // Position below the node
    sprite.backgroundColor = 'rgba(0,0,0,0.8)';
    sprite.padding = [3, 2];
    sprite.borderRadius = 4;
    sprite.borderColor = color;
    sprite.borderWidth = 0.5;
    group.add(sprite);

    return group;
});

// Setup Scene, Camera, and Floor
const scene = Graph.scene();

// Add a high-tech Cyber-Grid Floor
const gridHelper = new THREE.GridHelper(1000, 40, '#00f2fe', '#ffffff');
gridHelper.position.y = -60;
gridHelper.material.opacity = 0.1;
gridHelper.material.transparent = true;
scene.add(gridHelper);

// Smooth static camera position for architecture viewing
Graph.cameraPosition({ x: 0, y: 150, z: 350 }, { x: 0, y: 0, z: 0 });

// Lighting
scene.add(new THREE.AmbientLight(0x404040, 2));
const pointLight = new THREE.PointLight(0xffffff, 2, 1000);
pointLight.position.set(200, 200, 200);
scene.add(pointLight);

// Window resize handler
window.addEventListener('resize', () => {
    Graph.width(window.innerWidth);
    Graph.height(window.innerHeight);
});
