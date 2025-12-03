import { Mesh, Texture, Observable, Scene, FreeCamera, Vector3, PBRMaterial, DynamicTexture } from "@babylonjs/core";
import { AdvancedDynamicTexture, StackPanel, Button, InputText, TextBlock, Rectangle, Control } from "@babylonjs/gui";
import { Assets } from "./assets";

export class Billboard {
    private _racerName: InputText;

    public readonly onGameStartObservable = new Observable<void>();

    constructor(scene: Scene, assets: Assets) {
        const root = new Mesh("billboard", scene)

        // 创建程序化背景
        const backgroundPlane = Mesh.CreatePlane("backgroundPlane", 5, scene);
        backgroundPlane.scaling.x = 1.8;
        backgroundPlane.position.set(0, 10, 10 - 0.1);
        
        // 使用 DynamicTexture 生成炫酷背景
        const bgTexture = new DynamicTexture("bgTexture", { width: 1024, height: 512 }, scene, false);
        const ctx = bgTexture.getContext() as CanvasRenderingContext2D;
        
        // 创建赛车主题渐变背景
        const gradient = ctx.createLinearGradient(0, 0, 1024, 512);
        gradient.addColorStop(0, "#0F2027");    // 深蓝黑
        gradient.addColorStop(0.5, "#203A43");  // 青灰
        gradient.addColorStop(1, "#2C5364");    // 深青
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 512);
        
        // 添加赛道线条效果
        ctx.strokeStyle = "rgba(255, 215, 0, 0.3)";
        ctx.lineWidth = 8;
        for (let i = 0; i < 5; i++) {
            const y = 100 + i * 80;
            ctx.beginPath();
            ctx.moveTo(0, y);
            for (let x = 0; x < 1024; x += 60) {
                if ((x / 60 + i) % 2 === 0) {
                    ctx.lineTo(x, y);
                    ctx.lineTo(x + 40, y);
                } else {
                    ctx.moveTo(x + 40, y);
                }
            }
            ctx.stroke();
        }
        
        // 添加速度线效果
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 2;
        for (let i = 0; i < 20; i++) {
            const y = Math.random() * 512;
            const length = 100 + Math.random() * 150;
            ctx.beginPath();
            ctx.moveTo(1024, y);
            ctx.lineTo(1024 - length, y);
            ctx.stroke();
        }
        
        // 添加光晕效果
        const glow = ctx.createRadialGradient(512, 256, 50, 512, 256, 400);
        glow.addColorStop(0, "rgba(255, 215, 0, 0.2)");
        glow.addColorStop(0.5, "rgba(255, 140, 0, 0.1)");
        glow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, 1024, 512);
        
        // 添加标题文字
        ctx.font = "bold 120px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // 文字阴影
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
        
        // 渐变文字
        const textGradient = ctx.createLinearGradient(200, 0, 824, 0);
        textGradient.addColorStop(0, "#FFD700");
        textGradient.addColorStop(0.5, "#FFA500");
        textGradient.addColorStop(1, "#FFD700");
        ctx.fillStyle = textGradient;
        ctx.fillText("KART RACER", 512, 200);
        
        // 添加副标题
        ctx.font = "30px Arial";
        ctx.shadowBlur = 10;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText("🏁 Ready to Race 🏁", 512, 320);
        
        bgTexture.update();
        
        const backgroundMaterial = assets.unlitMaterial.clone("backgroundPlane");
        backgroundMaterial.unlit = true;
        backgroundMaterial.albedoTexture = bgTexture;
        backgroundPlane.material = backgroundMaterial;
        backgroundPlane.parent = root;

        const guiPlane = Mesh.CreatePlane("guiPlane", 6, scene);
        guiPlane.position.set(0, 10, 10 - 0.2);
        guiPlane.material = assets.unlitMaterial;
        guiPlane.parent = root;

        const mainMenuGUI = AdvancedDynamicTexture.CreateForMesh(guiPlane);

        // 创建一个带背景的容器
        const container = new Rectangle("container");
        container.width = "850px";
        container.height = "450px";
        container.cornerRadius = 20;
        container.color = "transparent";
        container.thickness = 0;
        container.background = "rgba(0, 0, 0, 0.6)";
        container.shadowColor = "rgba(0, 0, 0, 0.8)";
        container.shadowBlur = 30;
        container.shadowOffsetX = 0;
        container.shadowOffsetY = 10;
        container.top = "50px";
        mainMenuGUI.addControl(container);

        const stackPanel = new StackPanel();
        stackPanel.width = "700px";
        stackPanel.paddingTop = "40px";
        stackPanel.spacing = 20;
        stackPanel.horizontalAlignment = StackPanel.HORIZONTAL_ALIGNMENT_CENTER;
        container.addControl(stackPanel);

        // 游戏标题
        const title = new TextBlock("title", "🏎️ KART RACER 🏁");
        title.height = "80px";
        title.fontSize = 48;
        title.color = "#FFD700";
        title.fontWeight = "bold";
        title.textWrapping = false;
        title.shadowColor = "rgba(0, 0, 0, 0.8)";
        title.shadowBlur = 10;
        title.shadowOffsetX = 2;
        title.shadowOffsetY = 2;
        stackPanel.addControl(title);

        // 副标题
        const subtitle = new TextBlock("subtitle", "Start Your Racing Adventure");
        subtitle.height = "30px";
        subtitle.fontSize = 20;
        subtitle.color = "#B0B0B0";
        subtitle.fontStyle = "italic";
        subtitle.paddingBottom = "20px";
        stackPanel.addControl(subtitle);

        // 输入框标签
        const nameLabel = new TextBlock("nameLabel", "Player Name");
        nameLabel.height = "30px";
        nameLabel.fontSize = 18;
        nameLabel.color = "#FFFFFF";
        nameLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        nameLabel.paddingLeft = "10px";
        stackPanel.addControl(nameLabel);

        const racerName = new InputText("racerName");
        racerName.width = 1;
        racerName.height = "60px";
        racerName.placeholderText = "Enter your name...";
        racerName.placeholderColor = "#999999";
        racerName.fontSize = 28;
        racerName.color = "#000000";
        racerName.background = "rgba(255, 255, 255, 0.95)";
        racerName.focusedBackground = "rgba(255, 255, 255, 1)";
        racerName.hoverCursor = "text";
        racerName.thickness = 3;
        racerName.focusedColor = "#FFD700";
        racerName.paddingLeft = "15px";
        racerName.paddingRight = "15px";
        stackPanel.addControl(racerName);

        const startButton = Button.CreateSimpleButton("start", "🚀 START RACE");
        startButton.width = 1;
        startButton.height = "70px";
        startButton.color = "white";
        startButton.fontSize = 32;
        startButton.fontWeight = "bold";
        startButton.background = "linear-gradient(180deg, #4CAF50 0%, #45a049 100%)";
        startButton.thickness = 0;
        startButton.cornerRadius = 12;
        startButton.shadowColor = "rgba(0, 0, 0, 0.5)";
        startButton.shadowBlur = 15;
        startButton.shadowOffsetY = 5;
        startButton.paddingTop = "10px";
        
        // 按钮悬停效果
        startButton.onPointerEnterObservable.add(() => {
            startButton.background = "linear-gradient(180deg, #5DBF5F 0%, #4CAF50 100%)";
            startButton.scaleX = 1.02;
            startButton.scaleY = 1.02;
        });
        
        startButton.onPointerOutObservable.add(() => {
            startButton.background = "linear-gradient(180deg, #4CAF50 0%, #45a049 100%)";
            startButton.scaleX = 1;
            startButton.scaleY = 1;
        });
        
        stackPanel.addControl(startButton);

        // 底部提示文字
        const hint = new TextBlock("hint", "Press Enter to start or ESC to quit");
        hint.height = "25px";
        hint.fontSize = 14;
        hint.color = "rgba(255, 255, 255, 0.6)";
        hint.paddingTop = "20px";
        stackPanel.addControl(hint);

        const billBoardBase = Mesh.CreateBox("base", 1, scene)
        billBoardBase.scaling.y = 10;
        billBoardBase.position.set(0, 5, 10.51);
        billBoardBase.setParent(root);

        const billBoardPanel = Mesh.CreateBox("billboard", 1, scene)
        billBoardPanel.scaling.x = 12;
        billBoardPanel.scaling.y = 6;
        billBoardPanel.position.set(0, 10, 10.51);
        billBoardPanel.setParent(root);

        startButton.onPointerUpObservable.add(() => {
            this.onGameStartObservable.notifyObservers();
        });

        const camera = new FreeCamera("camera", new Vector3(0, 10, 3), scene);
        camera.parent = root;

        scene.activeCamera = camera;

        // Get racer name from local storage if available
        if (typeof localStorage === "object") {
            const value = localStorage.getItem("KartRacer.PlayerName");
            if (value) {
                racerName.text = value;
            }
        }

        this._racerName = racerName;
    }

    public get racerName(): string {
        const racerName = this._racerName.text.trim();
        if (!racerName) {
            let num = Math.floor(Math.random() * 10000);
            this._racerName.text = ("kart_" + num);
        }

        return racerName;
    }
}