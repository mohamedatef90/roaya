import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  ViewChild,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AdditiveBlending,
  AmbientLight,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Clock,
  Color,
  DirectionalLight,
  DoubleSide,
  Group,
  Mesh,
  MeshPhongMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SpotLight,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector3,
  WebGLRenderer
} from 'three';

type EarthTextures = {
  colorMap: Texture;
  specularMap: Texture;
  cloudsMap: Texture;
};

@Component({
  selector: 'app-cosmic-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cosmic-loader.component.html',
  styleUrl: './cosmic-loader.component.scss'
})
export class CosmicLoaderComponent implements AfterViewInit, OnDestroy {
  @Input() label = 'Loading';

  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  private renderer?: WebGLRenderer;
  private scene?: Scene;
  private camera?: PerspectiveCamera;
  private earthGroup?: Group;
  private earthMesh?: Mesh;
  private cloudsMesh?: Mesh;
  private milkyWay?: Points;
  private starField?: Points;
  private animationFrameId = 0;
  private prefersReducedMotion = false;
  private clock = new Clock();
  private loadedTextures: Texture[] = [];
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.isBrowser) {
      return;
    }

    this.prefersReducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    await this.setupScene();
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) {
      return;
    }

    window.removeEventListener('resize', this.handleResize);
    this.stopAnimationLoop();
    this.disposeResources();
  }

  private async setupScene(): Promise<void> {
    const container = this.canvasContainer.nativeElement;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.scene = new Scene();
    this.scene.background = new Color('#050c1f');

    this.camera = new PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 6);

    try {
      this.renderer = new WebGLRenderer({
        canvas: this.canvas.nativeElement,
        antialias: true,
        alpha: true
      });
    } catch (error) {
      console.error('WebGL renderer init failed', error);
      return;
    }

    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height, false);

    this.addLights();
    this.milkyWay = this.createMilkyWayBand();
    this.starField = this.createStarField();
    this.scene.add(this.milkyWay, this.starField);

    let textures: EarthTextures | null = null;
    try {
      textures = await this.loadTextures();
    } catch (error) {
      console.warn('Falling back to solid Earth material; texture load failed.', error);
    }
    this.addEarth(textures);

    this.renderFrame();
    window.addEventListener('resize', this.handleResize);

    if (!this.prefersReducedMotion) {
      this.startAnimationLoop();
    }
  }

  private addLights(): void {
    if (!this.scene) return;

    const ambient = new AmbientLight('#112244', 0.5);
    const sun = new DirectionalLight('#ffffff', 3);
    sun.position.set(-5, 5, 2);

    const rimLight = new SpotLight('#0066ff', 8, 50, 1, 1);
    rimLight.position.set(0, -10, 5);

    this.scene.add(ambient, sun, rimLight);
  }

  private addEarth(textures: EarthTextures | null): void {
    if (!this.scene) return;

    const earthGroup = new Group();
    earthGroup.position.set(0, -12, 0);
    earthGroup.rotation.set(0.4, 0, 0);
    this.earthGroup = earthGroup;

    const earthGeometry = new SphereGeometry(1, 128, 128);
    const earthMaterial = new MeshPhongMaterial({
      map: textures?.colorMap ?? null,
      specularMap: textures?.specularMap ?? null,
      shininess: 15,
      color: textures ? undefined : new Color('#2d5a7b'),
      specular: new Color('#222222')
    });
    const earthMesh = new Mesh(earthGeometry, earthMaterial);
    earthMesh.scale.setScalar(12);
    this.earthMesh = earthMesh;
    earthGroup.add(earthMesh);

    const cloudsGeometry = new SphereGeometry(1, 128, 128);
    const cloudsMaterial = new MeshPhongMaterial({
      map: textures?.cloudsMap ?? null,
      transparent: true,
      opacity: textures ? 0.3 : 0,
      depthWrite: false,
      side: DoubleSide,
      blending: AdditiveBlending
    });
    const cloudsMesh = new Mesh(cloudsGeometry, cloudsMaterial);
    cloudsMesh.scale.setScalar(12.1);
    this.cloudsMesh = cloudsMesh;
    earthGroup.add(cloudsMesh);

    const atmosphereGeometry = new SphereGeometry(1, 128, 128);
    const atmosphereMaterial = new ShaderMaterial({
      uniforms: {
        color: { value: new Color('#00aaff') },
        coefficient: { value: 0.4 },
        power: { value: 5.0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float coefficient;
        uniform float power;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(coefficient - dot(vNormal, vec3(0.0, 0.0, 1.0)), power);
          gl_FragColor = vec4(color, 1.0) * intensity;
        }
      `,
      blending: AdditiveBlending,
      side: BackSide,
      transparent: true
    });
    const atmosphereMesh = new Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphereMesh.scale.setScalar(12.8);
    earthGroup.add(atmosphereMesh);

    this.scene.add(earthGroup);
  }

  private createStarField(): Points {
    const count = 8000;
    const positions = new Float32Array(count * 3);
    const color = new Color('#ffffff');

    for (let i = 0; i < count; i++) {
      const radius = Math.random() * 300 + 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));

    const material = new PointsMaterial({
      size: 0.8,
      sizeAttenuation: true,
      color,
      transparent: true,
      opacity: 0.8,
      depthWrite: false
    });

    return new Points(geometry, material);
  }

  private createMilkyWayBand(): Points {
    const count = 15000;
    const radius = 350;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const centerColor = new Color('#e0dfff');
    const edgeColor = new Color('#201147');

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const u = (Math.random() - 0.5) * 2;
      const v = Math.random();
      const spread = u * Math.pow(v, 2) * 120;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = spread;
      const noise = (Math.random() - 0.5) * 20;

      const position = new Vector3(x + noise, y + noise, z + noise);
      position.applyAxisAngle(new Vector3(1, 0, 0), Math.PI / 3);
      position.applyAxisAngle(new Vector3(0, 0, 1), Math.PI / 6);

      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;

      const distFromCenter = Math.min(Math.abs(spread) / 60, 1);
      const mixed = centerColor.clone().lerp(edgeColor, distFromCenter);
      mixed.multiplyScalar(0.5 + Math.random() * 0.5);

      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));

    const material = new PointsMaterial({
      size: 2.0,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: AdditiveBlending,
      depthWrite: false
    });

    const points = new Points(geometry, material);
    points.position.set(0, 0, 0);
    return points;
  }

  private async loadTextures(): Promise<EarthTextures> {
    const loader = new TextureLoader();
    loader.setCrossOrigin('anonymous');

    const urls = [
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'
    ];

    const maps = await Promise.all(urls.map(url => loader.loadAsync(url)));
    maps.forEach(map => {
      map.colorSpace = SRGBColorSpace;
      this.loadedTextures.push(map);
    });

    const [colorMap, specularMap, cloudsMap] = maps;
    return { colorMap, specularMap, cloudsMap };
  }

  private startAnimationLoop(): void {
    const tick = () => {
      this.updateAnimations();
      this.renderFrame();
      this.animationFrameId = requestAnimationFrame(tick);
    };

    this.animationFrameId = requestAnimationFrame(tick);
  }

  private updateAnimations(): void {
    if (!this.earthMesh || !this.cloudsMesh) return;

    const elapsed = this.clock.getElapsedTime();
    const rotationOffset = 0.9;

    this.earthMesh.rotation.y = rotationOffset + elapsed * 0.02;
    this.cloudsMesh.rotation.y = rotationOffset + elapsed * 0.025;

    if (this.milkyWay) {
      this.milkyWay.rotation.y += 0.0005;
    }
    if (this.starField) {
      this.starField.rotation.y += 0.0003;
    }
  }

  private renderFrame(): void {
    if (!this.renderer || !this.scene || !this.camera) return;
    this.renderer.render(this.scene, this.camera);
  }

  private stopAnimationLoop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }
  }

  private handleResize = (): void => {
    if (!this.renderer || !this.camera) return;

    const container = this.canvasContainer.nativeElement;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);

    this.renderFrame();
  };

  private disposeResources(): void {
    if (this.scene) {
      this.scene.traverse(object => {
        const mesh = object as Mesh;
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }
        const material = mesh.material;
        if (Array.isArray(material)) {
          material.forEach(mat => mat.dispose && mat.dispose());
        } else if (material && 'dispose' in material) {
          material.dispose();
        }
      });
    }

    this.loadedTextures.forEach(texture => texture.dispose());
    this.loadedTextures = [];
    this.renderer?.dispose();
  }
}
