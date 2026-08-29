(() => {
    const start = () => {
        if (typeof THREE === 'undefined') {
            setTimeout(start, 50);
            return;
        }

        const container = document.getElementById('three-bg');
        if (!container) return;

        container.querySelectorAll('canvas').forEach(canvas => canvas.remove());

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(
            window.innerWidth < 768 ? 52 : 45,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );

        camera.position.set(
            0,
            0,
            window.innerWidth < 768 ? 9 : 8
        );

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;

        container.innerHTML = '';
        container.appendChild(renderer.domElement);

        const ambient = new THREE.AmbientLight(0xffffff, 1.1);
        scene.add(ambient);

        const light1 = new THREE.DirectionalLight(0x4f8cff, 2.5);
        light1.position.set(5, 6, 7);
        scene.add(light1);

        const light2 = new THREE.DirectionalLight(0x8b5cf6, 2);
        light2.position.set(-5, 2, 5);
        scene.add(light2);

        const pointLight = new THREE.PointLight(0x2563eb, 2.5, 20);
        pointLight.position.set(0, 0, 5);
        scene.add(pointLight);

        const network = new THREE.Group();
        scene.add(network);

        const fragments = new THREE.Group();
        scene.add(fragments);

        const scale = window.innerWidth < 768 ? 0.72 : 1;

        const coreMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x2563eb,
            metalness: 0.65,
            roughness: 0.12,
            transparent: true,
            opacity: 0.22,
            emissive: 0x2563eb,
            emissiveIntensity: 0.35,
            clearcoat: 1,
            clearcoatRoughness: 0.05
        });

        const core = new THREE.Mesh(
            new THREE.IcosahedronGeometry(1.15 * scale, 2),
            coreMaterial
        );

        network.add(core);

        const coreWire = new THREE.Mesh(
            new THREE.IcosahedronGeometry(1.23 * scale, 2),
            new THREE.MeshBasicMaterial({
                color: 0x60a5fa,
                wireframe: true,
                transparent: true,
                opacity: 0.45
            })
        );

        network.add(coreWire);

        const innerCore = new THREE.Mesh(
            new THREE.IcosahedronGeometry(0.58 * scale, 1),
            new THREE.MeshBasicMaterial({
                color: 0x60a5fa,
                transparent: true,
                opacity: 0.14,
                wireframe: true
            })
        );

        network.add(innerCore);

        const nodeMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x60a5fa,
            metalness: 0.4,
            roughness: 0.08,
            transparent: true,
            opacity: 0.55,
            emissive: 0x2563eb,
            emissiveIntensity: 0.8,
            clearcoat: 1
        });

        const nodeGlowMaterial = new THREE.MeshBasicMaterial({
            color: 0x60a5fa,
            transparent: true,
            opacity: 0.16
        });

        const nodes = [];

        const nodePositions = [
            [-2.35, 1.25, 0.25],
            [2.35, 1.15, -0.35],
            [-2.5, -1.1, 0.4],
            [2.4, -1.25, 0.15],
            [-0.35, 2.45, 0.1],
            [0.5, -2.4, 0.2],
            [-1.25, 0.15, 1.9],
            [1.35, 0.05, 1.8],
            [-1.15, -1.65, -1.25],
            [1.25, 1.55, -1.35]
        ];

        nodePositions.forEach((pos, index) => {
            const node = new THREE.Group();

            const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(
                    index % 3 === 0
                        ? 0.16 * scale
                        : 0.11 * scale,
                    16,
                    16
                ),
                nodeMaterial
            );

            node.add(sphere);

            const glow = new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.28 * scale,
                    12,
                    12
                ),
                nodeGlowMaterial
            );

            node.add(glow);

            node.position.set(
                pos[0] * scale,
                pos[1] * scale,
                pos[2] * scale
            );

            node.userData.phase =
                Math.random() * Math.PI * 2;

            network.add(node);
            nodes.push(node);
        });

        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x4f8cff,
            transparent: true,
            opacity: 0.22
        });

        const connections = [
            [0, 1],
            [0, 2],
            [0, 4],
            [0, 6],
            [1, 3],
            [1, 4],
            [1, 7],
            [1, 9],
            [2, 3],
            [2, 5],
            [2, 6],
            [2, 8],
            [3, 5],
            [3, 7],
            [3, 9],
            [4, 7],
            [4, 6],
            [5, 8],
            [5, 9],
            [6, 8],
            [7, 9],
            [8, 9]
        ];

        connections.forEach(connection => {
            const a = nodes[connection[0]].position;
            const b = nodes[connection[1]].position;

            const geometry =
                new THREE.BufferGeometry().setFromPoints([
                    a,
                    b
                ]);

            network.add(
                new THREE.Line(
                    geometry,
                    lineMaterial
                )
            );
        });

        nodes.forEach(node => {
            const geometry =
                new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(0, 0, 0),
                    node.position
                ]);

            network.add(
                new THREE.Line(
                    geometry,
                    new THREE.LineBasicMaterial({
                        color: 0x7c3aed,
                        transparent: true,
                        opacity: 0.13
                    })
                )
            );
        });

        const packetMaterial =
            new THREE.MeshBasicMaterial({
                color: 0x93c5fd
            });

        const packets = [];

        connections.forEach((connection, index) => {
            const packet = new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.035 * scale,
                    8,
                    8
                ),
                packetMaterial
            );

            packet.userData = {
                connection,
                progress: Math.random(),
                speed: 0.003 +
                    Math.random() * 0.004,
                direction:
                    index % 2 === 0 ? 1 : -1
            };

            network.add(packet);
            packets.push(packet);
        });

        const outerRing = new THREE.Mesh(
            new THREE.TorusGeometry(
                2.55 * scale,
                0.025 * scale,
                24,
                96
            ),
            new THREE.MeshBasicMaterial({
                color: 0x2563eb,
                transparent: true,
                opacity: 0.16
            })
        );

        outerRing.rotation.x =
            Math.PI * 0.42;

        outerRing.rotation.z = 0.25;

        network.add(outerRing);

        const outerRing2 = new THREE.Mesh(
            new THREE.TorusGeometry(
                2.15 * scale,
                0.02 * scale,
                24,
                96
            ),
            new THREE.MeshBasicMaterial({
                color: 0x7c3aed,
                transparent: true,
                opacity: 0.14
            })
        );

        outerRing2.rotation.x =
            Math.PI * 0.75;

        outerRing2.rotation.y = 0.4;

        network.add(outerRing2);

        const fragmentMaterials = [
            new THREE.MeshPhysicalMaterial({
                color: 0x2563eb,
                metalness: 0.5,
                roughness: 0.2,
                transparent: true,
                opacity: 0.13,
                emissive: 0x2563eb,
                emissiveIntensity: 0.25,
                side: THREE.DoubleSide
            }),

            new THREE.MeshPhysicalMaterial({
                color: 0x7c3aed,
                metalness: 0.4,
                roughness: 0.2,
                transparent: true,
                opacity: 0.11,
                emissive: 0x7c3aed,
                emissiveIntensity: 0.2,
                side: THREE.DoubleSide
            }),

            new THREE.MeshPhysicalMaterial({
                color: 0x60a5fa,
                metalness: 0.3,
                roughness: 0.25,
                transparent: true,
                opacity: 0.1,
                emissive: 0x60a5fa,
                emissiveIntensity: 0.18,
                side: THREE.DoubleSide
            })
        ];

        const fragmentCount =
            window.innerWidth < 768 ? 35 : 75;

        const fragmentObjects = [];

        for (let i = 0; i < fragmentCount; i++) {
            const size =
                0.08 +
                Math.random() * 0.28;

            const geometry =
                new THREE.TetrahedronGeometry(
                    size,
                    0
                );

            const material =
                fragmentMaterials[
                    Math.floor(
                        Math.random() *
                        fragmentMaterials.length
                    )
                ];

            const fragment =
                new THREE.Mesh(
                    geometry,
                    material
                );

            const angle =
                Math.random() *
                Math.PI * 2;

            const radius =
                3.2 +
                Math.random() * 4.5;

            fragment.position.set(
                Math.cos(angle) *
                    radius,

                (Math.random() - 0.5) *
                    6.5,

                -1.5 +
                    Math.random() * 5
            );

            fragment.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            fragment.userData = {
                baseX: fragment.position.x,
                baseY: fragment.position.y,
                baseZ: fragment.position.z,
                rotationX:
                    (Math.random() - 0.5) *
                    0.012,
                rotationY:
                    (Math.random() - 0.5) *
                    0.018,
                rotationZ:
                    (Math.random() - 0.5) *
                    0.014,
                speed:
                    0.3 +
                    Math.random() * 0.8,
                phase:
                    Math.random() *
                    Math.PI * 2,
                depth:
                    0.3 +
                    Math.random() * 1.4,
                drift:
                    0.15 +
                    Math.random() * 0.45
            };

            fragments.add(fragment);
            fragmentObjects.push(fragment);
        }

        const shardLines = [];

        for (let i = 0; i < 22; i++) {
            const points = [];

            const x =
                (Math.random() - 0.5) *
                12;

            const y =
                (Math.random() - 0.5) *
                7;

            const z =
                -0.5 +
                Math.random() * 4;

            points.push(
                new THREE.Vector3(
                    x,
                    y,
                    z
                )
            );

            points.push(
                new THREE.Vector3(
                    x +
                        (Math.random() - 0.5) *
                        2.5,

                    y +
                        (Math.random() - 0.5) *
                        1.8,

                    z +
                        (Math.random() - 0.5) *
                        1.5
                )
            );

            const geometry =
                new THREE.BufferGeometry()
                    .setFromPoints(points);

            const line =
                new THREE.Line(
                    geometry,
                    new THREE.LineBasicMaterial({
                        color:
                            i % 2 === 0
                                ? 0x2563eb
                                : 0x7c3aed,
                        transparent: true,
                        opacity: 0.08
                    })
                );

            fragments.add(line);
            shardLines.push(line);
        }

        const particleCount =
            window.innerWidth < 768
                ? 80
                : 170;

        const particlePositions =
            new Float32Array(
                particleCount * 3
            );

        for (
            let i = 0;
            i < particleCount;
            i++
        ) {
            particlePositions[i * 3] =
                (Math.random() - 0.5) *
                13;

            particlePositions[i * 3 + 1] =
                (Math.random() - 0.5) *
                8;

            particlePositions[i * 3 + 2] =
                -2 +
                Math.random() * 7;
        }

        const particleGeometry =
            new THREE.BufferGeometry();

        particleGeometry.setAttribute(
            'position',
            new THREE.BufferAttribute(
                particlePositions,
                3
            )
        );

        const particles =
            new THREE.Points(
                particleGeometry,
                new THREE.PointsMaterial({
                    color: 0x60a5fa,
                    size:
                        window.innerWidth < 768
                            ? 0.025
                            : 0.035,
                    transparent: true,
                    opacity: 0.35,
                    blending:
                        THREE.AdditiveBlending,
                    sizeAttenuation: true
                })
            );

        fragments.add(particles);

        const scrollState = {
            current: 0,
            target: 0
        };

        let mouseX = 0;
        let mouseY = 0;

        const updateScrollTarget = () => {
            const maxScroll =
                Math.max(
                    document.documentElement
                        .scrollHeight -
                        window.innerHeight,
                    1
                );

            scrollState.target =
                window.scrollY /
                maxScroll;
        };

        window.addEventListener(
            'scroll',
            updateScrollTarget,
            {
                passive: true
            }
        );

        document.addEventListener(
            'mousemove',
            e => {
                mouseX =
                    (e.clientX /
                        window.innerWidth -
                        0.5) * 2;

                mouseY =
                    (e.clientY /
                        window.innerHeight -
                        0.5) * 2;
            },
            {
                passive: true
            }
        );

        let lastTime =
            performance.now();

        const animate = now => {
            requestAnimationFrame(
                animate
            );

            const delta =
                Math.min(
                    (now - lastTime) /
                        16.67,
                    2
                );

            lastTime = now;

            scrollState.current +=
                (
                    scrollState.target -
                    scrollState.current
                ) *
                0.075 *
                delta;

            const p =
                scrollState.current;

            const angle =
                p *
                Math.PI *
                2.7;

            const x =
                Math.sin(
                    angle * 0.82
                ) *
                2.9 +
                Math.sin(
                    angle * 0.31
                ) *
                0.8;

            const y =
                Math.cos(
                    angle * 0.57
                ) *
                1.9 -
                p *
                1.0;

            const z =
                Math.sin(
                    angle * 0.43
                ) *
                0.8;

            const scalePulse =
                1 +
                Math.sin(
                    p *
                    Math.PI *
                    8
                ) *
                0.035;

            network.position.x +=
                (
                    x -
                    network.position.x
                ) *
                0.08 *
                delta;

            network.position.y +=
                (
                    y -
                    network.position.y
                ) *
                0.08 *
                delta;

            network.position.z +=
                (
                    z -
                    network.position.z
                ) *
                0.08 *
                delta;

            network.scale.setScalar(
                scalePulse
            );

            network.rotation.x +=
                (
                    0.0018 +
                    p * 0.0045
                ) *
                delta;

            network.rotation.y +=
                (
                    0.003 +
                    p * 0.008
                ) *
                delta;

            network.rotation.z +=
                (
                    0.0012 +
                    p * 0.003
                ) *
                delta;

            core.rotation.x +=
                0.0025 *
                delta;

            core.rotation.y +=
                0.004 *
                delta;

            coreWire.rotation.x -=
                0.0015 *
                delta;

            coreWire.rotation.y +=
                0.003 *
                delta;

            innerCore.rotation.x +=
                0.004 *
                delta;

            innerCore.rotation.y -=
                0.005 *
                delta;

            outerRing.rotation.y +=
                0.004 *
                delta;

            outerRing.rotation.z +=
                0.002 *
                delta;

            outerRing2.rotation.x -=
                0.003 *
                delta;

            outerRing2.rotation.y +=
                0.005 *
                delta;

            nodes.forEach(
                node => {
                    const pulse =
                        1 +
                        Math.sin(
                            now * 0.003 +
                            node.userData.phase
                        ) *
                        0.12;

                    node.scale.setScalar(
                        pulse
                    );
                }
            );

            packets.forEach(
                packet => {
                    const data =
                        packet.userData;

                    data.progress +=
                        data.speed *
                        data.direction *
                        delta;

                    if (
                        data.progress > 1
                    )
                        data.progress = 0;

                    if (
                        data.progress < 0
                    )
                        data.progress = 1;

                    const a =
                        nodes[
                            data.connection[0]
                        ].position;

                    const b =
                        nodes[
                            data.connection[1]
                        ].position;

                    packet.position.lerpVectors(
                        a,
                        b,
                        data.progress
                    );
                }
            );

            fragmentObjects.forEach(
                fragment => {
                    const data =
                        fragment.userData;

                    fragment.rotation.x +=
                        data.rotationX *
                        delta;

                    fragment.rotation.y +=
                        data.rotationY *
                        delta;

                    fragment.rotation.z +=
                        data.rotationZ *
                        delta;

                    const drift =
                        Math.sin(
                            now * 0.0006 *
                                data.speed +
                            data.phase
                        );

                    fragment.position.x =
                        data.baseX +
                        drift *
                        data.drift;

                    fragment.position.y =
                        data.baseY +
                        Math.cos(
                            now * 0.0005 *
                                data.speed +
                            data.phase
                        ) *
                        data.drift;

                    fragment.position.z =
                        data.baseZ +
                        p *
                        data.depth *
                        1.8;
                }
            );

            fragments.position.x +=
                (
                    mouseX * 0.45 -
                    fragments.position.x
                ) *
                0.025 *
                delta;

            fragments.position.y +=
                (
                    -mouseY * 0.35 -
                    fragments.position.y
                ) *
                0.025 *
                delta;

            fragments.position.z +=
                (
                    p * 0.8 -
                    fragments.position.z
                ) *
                0.012 *
                delta;

            fragments.rotation.x +=
                mouseY *
                0.00035 *
                delta;

            fragments.rotation.y +=
                mouseX *
                0.00045 *
                delta;

            shardLines.forEach(
                (line, index) => {
                    line.rotation.z +=
                        (
                            index % 2 === 0
                                ? 0.0005
                                : -0.00035
                        ) *
                        delta;
                }
            );

            network.rotation.x +=
                mouseY *
                0.0007 *
                delta;

            network.rotation.y +=
                mouseX *
                0.0009 *
                delta;

            camera.position.x +=
                (
                    mouseX * 0.12 -
                    camera.position.x
                ) *
                0.025;

            camera.position.y +=
                (
                    -mouseY * 0.08 -
                    camera.position.y
                ) *
                0.025;

            camera.lookAt(0, 0, 0);

            renderer.render(
                scene,
                camera
            );
        };

        updateScrollTarget();

        requestAnimationFrame(
            animate
        );

        window.addEventListener(
            'resize',
            () => {
                const w =
                    window.innerWidth;

                const h =
                    window.innerHeight;

                const mobile =
                    w < 768;

                camera.aspect =
                    w / h;

                camera.position.z =
                    mobile ? 9 : 8;

                camera.updateProjectionMatrix();

                renderer.setSize(
                    w,
                    h
                );

                renderer.setPixelRatio(
                    Math.min(
                        window.devicePixelRatio,
                        1.8
                    )
                );
            }
        );
    };

    if (
        document.readyState ===
        'loading'
    ) {
        document.addEventListener(
            'DOMContentLoaded',
            start,
            { once: true }
        );
    } else {
        start();
    }
})();