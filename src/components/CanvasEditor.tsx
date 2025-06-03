import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import './CanvasEditor.css';

interface CanvasEditorProps {
  image: string;
  onCanvasReady: (c: fabric.Canvas) => void;
} 

const CanvasEditor: React.FC<CanvasEditorProps> = ({ image, onCanvasReady }) => {
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef   = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!canvasElRef.current || fabricRef.current) return;
    fabricRef.current = new fabric.Canvas(canvasElRef.current, {
      width: 400,
      height: 600,
    });
    onCanvasReady(fabricRef.current);

    return () => {
      fabricRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !image) return;

    fabric.Image.fromURL(
      image,
      img => {
        const el = img.getElement() as HTMLImageElement;
        if (!el.naturalWidth) {
          el.onload = () => canvas.setBackgroundImage(img, () => canvas.requestRenderAll());
          return;
        }
        const scale = Math.min(canvas.getWidth() / el.naturalWidth, canvas.getHeight() / el.naturalHeight);
        img.scale(scale).set({ left: 0, top: 0, originX: 'left', originY: 'top' });
        canvas.setBackgroundImage(img, () => canvas.requestRenderAll());
      },
      { crossOrigin: 'anonymous' }
    );
  }, [image]);

  return (
    <canvas
      ref={canvasElRef}
      width={400}
      height={600}
      style={{ border: '1px solid #ccc', display: 'block', marginTop: 8 }}
    />
  );
};

export default CanvasEditor;
