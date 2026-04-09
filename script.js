document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Canvas
    const canvasWrapper = document.getElementById('canvasWrapper');
    
    // We will set a fixed size for the design space (e.g., 800x600)
    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 600;
    
    const canvas = new fabric.Canvas('mockupCanvas', {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        backgroundColor: '#ffffff'
    });

    // 2. Variables
    const productItems = document.querySelectorAll('.product-item');
    const uploadArea = document.getElementById('uploadArea');
    const logoUpload = document.getElementById('logoUpload');
    const deleteBtn = document.getElementById('deleteBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    // 3. Load Initial Product Image
    loadProductImage(document.querySelector('.product-item.active').dataset.img);

    // 4. Handle Product Selection
    productItems.forEach(item => {
        item.addEventListener('click', () => {
            productItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            loadProductImage(item.dataset.img);
        });
    });

    function loadProductImage(url) {
        fabric.Image.fromURL(url, (img) => {
            // Calculate aspect ratio to fit the canvas
            const scale = Math.min(CANVAS_WIDTH / img.width, CANVAS_HEIGHT / img.height);
            img.scale(scale);
            
            // Center the background image
            canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                originX: 'center',
                originY: 'center',
                top: CANVAS_HEIGHT / 2,
                left: CANVAS_WIDTH / 2
            });
        }, { crossOrigin: 'anonymous' }); // Important for external URLs
    }

    // 5. Handle Logo Upload
    uploadArea.addEventListener('click', () => logoUpload.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            addLogoToCanvas(e.dataTransfer.files[0]);
        }
    });

    logoUpload.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            addLogoToCanvas(e.target.files[0]);
        }
    });

    function addLogoToCanvas(file) {
        const reader = new FileReader();
        reader.onload = function(f) {
            const data = f.target.result;
            fabric.Image.fromURL(data, (img) => {
                // Scale down slightly if logo is too big
                if (img.width > CANVAS_WIDTH / 2) {
                    img.scaleToWidth(CANVAS_WIDTH / 3);
                }
                
                // Add center location manually
                img.set({
                    left: CANVAS_WIDTH / 2,
                    top: CANVAS_HEIGHT / 2,
                    originX: 'center',
                    originY: 'center',
                    cornerColor: '#4f46e5',
                    cornerStrokeColor: '#4f46e5',
                    borderColor: '#4f46e5',
                    transparentCorners: false
                });

                canvas.add(img);
                canvas.setActiveObject(img);
            });
        };
        reader.readAsDataURL(file);
    }

    // 6. Delete Selected Object
    deleteBtn.addEventListener('click', () => {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            canvas.remove(activeObject);
        } else {
            alert('Vui lòng click chọn một logo/hình ảnh trên màn hình để xóa!');
        }
    });

    // Handle delete with 'Delete' key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            const activeObject = canvas.getActiveObject();
            if (activeObject && activeObject.type !== 'i-text') { // Prevent deleting text being typed if we add text features later
                canvas.remove(activeObject);
            }
        }
    });

    // 7. Download Final Mockup
    downloadBtn.addEventListener('click', () => {
        // Deselect objects to prevent showing selection bounds directly in the downloaded image
        canvas.discardActiveObject();
        canvas.renderAll();

        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2 // High resolution (1600x1200)
        });

        const link = document.createElement('a');
        link.download = 'thiet-ke-san-pham.png';
        link.href = dataURL;
        link.click();
    });
});