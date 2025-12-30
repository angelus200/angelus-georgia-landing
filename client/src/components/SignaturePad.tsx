import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eraser, Check, RotateCcw } from "lucide-react";

interface SignaturePadProps {
  onSave: (signature: string) => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
}

export function SignaturePad({
  onSave,
  onCancel,
  title = "Digitale Unterschrift",
  description = "Bitte unterschreiben Sie im Feld unten mit Ihrer Maus oder Ihrem Finger.",
  width = 500,
  height = 200,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set up canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Draw signature line
    ctx.beginPath();
    ctx.strokeStyle = "#e5e5e5";
    ctx.lineWidth = 1;
    ctx.moveTo(20, canvas.height - 40);
    ctx.lineTo(canvas.width - 20, canvas.height - 40);
    ctx.stroke();

    // Reset stroke style
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2;
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    setLastPoint(coords);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !lastPoint) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    setLastPoint(coords);
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Redraw signature line
    ctx.beginPath();
    ctx.strokeStyle = "#e5e5e5";
    ctx.lineWidth = 1;
    ctx.moveTo(20, canvas.height - 40);
    ctx.lineTo(canvas.width - 20, canvas.height - 40);
    ctx.stroke();

    // Reset stroke style
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2;

    setHasSignature(false);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    // Get the signature as base64 PNG
    const signature = canvas.toDataURL("image/png");
    onSave(signature);
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="w-full touch-none cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Unterschreiben Sie oberhalb der Linie
        </p>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearSignature}
            disabled={!hasSignature}
          >
            <Eraser className="h-4 w-4 mr-1" />
            Löschen
          </Button>
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Abbrechen
            </Button>
          )}
        </div>
        <Button
          onClick={saveSignature}
          disabled={!hasSignature}
          className="bg-[#C4A052] hover:bg-[#B39142]"
        >
          <Check className="h-4 w-4 mr-1" />
          Unterschrift bestätigen
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * Display a signature image
 */
export function SignatureDisplay({
  signature,
  label = "Unterschrift",
  date,
}: {
  signature: string;
  label?: string;
  date?: Date | string;
}) {
  const formattedDate = date
    ? new Date(date).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="border rounded-lg p-4 bg-white">
      <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
      <div className="border-b border-gray-200 pb-2">
        <img
          src={signature}
          alt={label}
          className="max-h-24 object-contain"
        />
      </div>
      {formattedDate && (
        <p className="text-xs text-muted-foreground mt-2">
          Unterschrieben am: {formattedDate}
        </p>
      )}
    </div>
  );
}
