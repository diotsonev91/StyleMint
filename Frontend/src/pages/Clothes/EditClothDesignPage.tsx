// EditClothDesignPage.tsx
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Center, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { clothDesignService } from "../../services/clothDesignService";
import { DesignDetailDTO } from "../../api/clothDesign.api";
import { Shirt } from "../../components/three/models/Shirt";
import { Hoodie } from "../../components/three/models/Hoodie";
import { Cap } from "../../components/three/models/Cap";
import { Shoe } from "../../components/three/models/Shoe";
import { AiOutlineArrowLeft, AiOutlineSave, AiOutlineShopping } from "react-icons/ai";
import { RiNftFill } from "react-icons/ri";
import "./EditClothDesignPage.css";

const colors = [
    "#ccc",
    "#EFBD4E",
    "#80C670",
    "#726DE8",
    "#EF674E",
    "#353934",
    "purple",
];

const defaultDecals = ["react", "three2", "react", "logo"];

export function EditClothDesignPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [design, setDesign] = useState<DesignDetailDTO | null>(null);

    // Editable state
    const [selectedColor, setSelectedColor] = useState("#ccc");
    const [selectedDecal, setSelectedDecal] = useState("react");
    const [decals, setDecals] = useState<string[]>(defaultDecals);
    const [rotationY, setRotationY] = useState(0);
    const [decalPosition, setDecalPosition] = useState<[number, number, number] | null>(null);
    const [customDecal, setCustomDecal] = useState<{ file: File; previewUrl: string } | null>(null);

    const designId = searchParams.get("id");

    useEffect(() => {
        if (!designId) {
            navigate("/my-designs");
            return;
        }
        loadDesign(designId);
    }, [designId]);

    const loadDesign = async (id: string) => {
        try {
            setLoading(true);
            const result = await clothDesignService.getDesignById(id);

            if (result.success && result.data) {
                const foundDesign = result.data;
                setDesign(foundDesign);

                // Load customization data
                const customization = foundDesign.customizationData;
                setSelectedColor(customization.selectedColor);
                setSelectedDecal(customization.selectedDecal);
                setRotationY(customization.rotationY || 0);
                setDecalPosition(customization.decalPosition as [number, number, number] | null);

                if (customization.decals) {
                    setDecals(customization.decals);
                }

                // Handle custom decal if exists
                if (customization.hasCustomDecal && foundDesign.customDecalUrl) {
                    // For editing, we show the existing custom decal URL
                    // Note: we can't reconstruct the File object, so we just use the URL
                    setDecals([...decals, 'custom']);
                }

            } else {
                setError(result.error || "Failed to load design");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!design) return;

        const confirmed = confirm("Save changes to this design?");
        if (!confirmed) return;

        try {
            // Convert clothType to proper enum format
            const clothTypeEnum = design.clothType; // Already in correct format from backend (e.g., "T_SHIRT_SPORT")

            const editState = {
                selectedColor,
                selectedDecal,
                decalPosition,
                rotationY,
                colors: decals,
                decals,
                selected_type: clothTypeEnum, // Use the backend format
                page: design.customizationData.page,
                customDecal,
            };

            const result = await clothDesignService.updateDesign(
                design.id,
                editState,
                design.label
            );

            if (result.success) {
                alert("✅ Design updated successfully!");
                navigate("/my-designs");
            } else {
                alert(`Failed to update design: ${result.error}`);
            }
        } catch (err) {
            console.error("Update error:", err);
            alert("Failed to save design");
        }
    };

    const handleAddToCart = () => {
        // TODO: Implement add to cart
        alert("Add to cart functionality coming soon!");
    };

    const uploadCustomDecal = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.onchange = (event) => {
            const target = event.target as HTMLInputElement;
            const file = target.files?.[0];

            if (file) {
                if (!file.type.startsWith("image/")) {
                    alert("Please select an image file");
                    return;
                }

                if (file.size > 5 * 1024 * 1024) {
                    alert("File size should be less than 5MB");
                    return;
                }

                // Clean up previous
                if (customDecal) {
                    URL.revokeObjectURL(customDecal.previewUrl);
                }

                const previewUrl = URL.createObjectURL(file);
                setCustomDecal({ file, previewUrl });

                // Add to decals if not already there
                if (!decals.includes("custom")) {
                    setDecals([...decals, "custom"]);
                }
                setSelectedDecal("custom");
            }
        };

        input.click();
    };

    if (loading) {
        return (
            <div className="edit-design-page">
                <div className="loading-spinner">Loading design...</div>
            </div>
        );
    }

    if (error || !design) {
        return (
            <div className="edit-design-page">
                <div className="error-message">
                    <h2>Error</h2>
                    <p>{error || "Design not found"}</p>
                    <button onClick={() => navigate("/my-designs")}>
                        Back to My Designs
                    </button>
                </div>
            </div>
        );
    }



    const isAdvanced = design.customizationData.page === "advanced";

    async function publishDesign(id: string) {
        const result = await clothDesignService.publishDesign(id);

        if (result.success) {
            alert("Design published successfully!");

            setDesign(prev =>
                prev ? { ...prev, public: true } : prev
            );
        } else {
            alert("Failed to publish design: " + result.error);
        }
    }

    async function unpublishDesign(id: string) {
        const result = await clothDesignService.unpublishDesign(id);

        if (result.success) {
            alert("Design unpublished successfully!");

            setDesign(prev =>
                prev ? { ...prev, public: false } : prev
            );
        } else {
            alert("Failed to unpublish design: " + result.error);
        }
    }


    return (
        <div className="edit-design-page">
            {/* Header */}
            <div className="edit-header">
                <button className="back-btn" onClick={() => navigate("/my-designs")}>
                    <AiOutlineArrowLeft /> Back to My Designs
                </button>
                <h1>Edit Design: {design.label}</h1>
                {design.public ? (
                    <button
                        className="design-btn-edit unpublish-btn"
                        onClick={() => unpublishDesign(design.id)}
                    >
                        Unpublish
                    </button>
                ) : (
                    <button
                        className="design-btn-edit publish-btn"
                        onClick={() => publishDesign(design.id)}
                    >
                        Publish
                    </button>
                )}

            </div>


            {/* Canvas and Controls */}
            <div className="edit-content">
                {/* 3D Canvas */}
                <div className="canvas-container">
                    <Canvas shadows camera={{ position: [-1, 0, 2.5], fov: 25 }}>
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
                        <hemisphereLight intensity={0.3} />
                        {/* In advanced mode, hold right mouse for orbit controls */}
                        <OrbitControls
                            enablePan={false}
                            enableZoom={true}
                            mouseButtons={{
                                LEFT: isAdvanced ? undefined : THREE.MOUSE.ROTATE,
                                MIDDLE: THREE.MOUSE.DOLLY,
                                RIGHT: THREE.MOUSE.ROTATE
                            }}
                        />

                        {/* Click logic for Advanced mode - позволява местене на декала */}
                        {isAdvanced && <ClickLogicForEdit onPositionChange={setDecalPosition} />}

                        <Center>
                            {design.clothType === "HOODIE" && (
                                <Hoodie
                                    advanced={isAdvanced}
                                    cartItem={{
                                        id: design.id,
                                        selectedColor,
                                        selectedDecal,
                                        selected_type: "hoodie",
                                        decalPosition,
                                        rotationY,
                                        ripples: [],
                                        quantity: 1,
                                        type: "clothes",

                                        hasCustomDecal: !!(customDecal || design.customizationData.hasCustomDecal),
                                        customDecalUrl: customDecal
                                            ? customDecal.previewUrl
                                            : design.customDecalUrl ?? null,
                                    }}
                                    rotationYOverride={rotationY}
                                />
                            )}

                            {design.clothType === "CAP" && (
                                <Cap
                                    advanced={isAdvanced}
                                    cartItem={{
                                        id: design.id,
                                        selectedColor,
                                        selectedDecal,
                                        selected_type: "cap",
                                        decalPosition,
                                        rotationY,
                                        ripples: [],
                                        quantity: 1,
                                        type: "clothes",

                                        hasCustomDecal: !!(customDecal || design.customizationData.hasCustomDecal),
                                        customDecalUrl: customDecal
                                            ? customDecal.previewUrl
                                            : design.customDecalUrl ?? null,
                                    }}
                                    rotationYOverride={rotationY}
                                />
                            )}

                            {design.clothType === "T_SHIRT_SPORT" && (
                                <Shirt
                                    variant="sport"
                                    advanced={isAdvanced}
                                    cartItem={{
                                        id: design.id,
                                        selectedColor,
                                        selectedDecal,
                                        selected_type: "t_shirt_sport",
                                        decalPosition,
                                        rotationY,
                                        ripples: [],
                                        quantity: 1,
                                        type: "clothes",

                                        hasCustomDecal: !!(customDecal || design.customizationData.hasCustomDecal),
                                        customDecalUrl: customDecal
                                            ? customDecal.previewUrl
                                            : design.customDecalUrl ?? null,
                                    }}
                                    rotationYOverride={rotationY}
                                />
                            )}

                            {design.clothType === "T_SHIRT_CLASSIC" && (
                                <Shirt
                                    variant="classic"
                                    advanced={isAdvanced}
                                    cartItem={{
                                        id: design.id,
                                        selectedColor,
                                        selectedDecal,
                                        selected_type: "t_shirt_classic",
                                        decalPosition,
                                        rotationY,
                                        ripples: [],
                                        quantity: 1,
                                        type: "clothes",

                                        hasCustomDecal: !!(customDecal || design.customizationData.hasCustomDecal),
                                        customDecalUrl: customDecal
                                            ? customDecal.previewUrl
                                            : design.customDecalUrl ?? null,
                                    }}
                                    rotationYOverride={rotationY}
                                />
                            )}

                            {design.clothType === "SHOE" && (
                                <Shoe
                                    advanced={isAdvanced}
                                    cartItem={{
                                        id: design.id,
                                        selectedColor,
                                        selectedDecal,
                                        selected_type: "shoe",
                                        decalPosition,
                                        rotationY,
                                        ripples: [],
                                        quantity: 1,
                                        type: "clothes",

                                        hasCustomDecal: !!(customDecal || design.customizationData.hasCustomDecal),
                                        customDecalUrl: customDecal
                                            ? customDecal.previewUrl
                                            : design.customDecalUrl ?? null,
                                    }}
                                    rotationYOverride={rotationY}
                                />
                            )}
                        </Center>

                    </Canvas>
                </div>

                {/* Controls Panel */}
                <div className="controls-panel">
                    <div className="control-section">
                        <h3>Colors</h3>
                        <div className="color-grid">
                            {colors.map((color) => (
                                <div
                                    key={color}
                                    className={`color-circle ${selectedColor === color ? "active" : ""}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setSelectedColor(color)}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="control-section">
                        <h3>Decals</h3>
                        <div className="decals-grid">
                            {decals.map((decal) => (
                                <div
                                    key={decal}
                                    className={`decal-item ${selectedDecal === decal ? "active" : ""}`}
                                    onClick={() => setSelectedDecal(decal)}
                                >
                                    {decal === "custom" ? (
                                        customDecal ? (
                                            <img src={customDecal.previewUrl} alt="Custom" />
                                        ) : design.customDecalUrl ? (
                                            <img src={design.customDecalUrl} alt="Custom" />
                                        ) : (
                                            <div className="custom-placeholder">Custom</div>
                                        )
                                    ) : (
                                        <img src={`/images/${decal}_thumb.png`} alt={decal} />
                                    )}
                                </div>
                            ))}
                        </div>

                        {isAdvanced && (
                            <button className="upload-btn" onClick={uploadCustomDecal}>
                                <RiNftFill /> Upload Custom Decal
                            </button>
                        )}
                    </div>

                    <div className="control-section">
                        <h3>Rotation: {Math.round(rotationY)}°</h3>
                        <input
                            type="range"
                            min={0}
                            max={360}
                            value={rotationY}
                            onChange={(e) => setRotationY(+e.target.value)}
                            className="rotation-slider"
                        />
                    </div>

                    {isAdvanced && (
                        <div className="advanced-tip">
                            💡 <strong>Tip:</strong> Click on the 3D model to reposition the decal!
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="action-buttons">
                        <button className="btn-save" onClick={handleSave}>
                            <AiOutlineSave /> Save Changes
                        </button>
                        <button className="btn-cart" onClick={handleAddToCart}>
                            <AiOutlineShopping /> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// Click Logic for Advanced Mode - Decal Positioning
// ============================================

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

interface ClickLogicForEditProps {
    onPositionChange: (position: [number, number, number]) => void;
}

function ClickLogicForEdit({ onPositionChange }: ClickLogicForEditProps) {
    const { camera, scene, gl } = useThree();

    const handleClick = useCallback(
        (e: any) => {
            const bounds = gl.domElement.getBoundingClientRect();

            mouse.x = ((e.clientX - bounds.left) / bounds.width) * 2 - 1;
            mouse.y = -((e.clientY - bounds.top) / bounds.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const hits = raycaster.intersectObjects(scene.children, true);

            if (!hits.length) return;

            const hit = hits[0];
            const local = hit.object.worldToLocal(hit.point.clone());
            const newPosition = local.toArray() as [number, number, number];

            // Update decal position
            onPositionChange(newPosition);

            console.log("🎯 Decal positioned at:", newPosition);
        },
        [camera, scene, gl, onPositionChange]
    );

    return (
        <mesh onPointerDown={handleClick}>
            {/* Invisible click catcher plane */}
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial transparent opacity={0} />
        </mesh>
    );
}