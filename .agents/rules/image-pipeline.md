# Image & Media Pipeline Rules

## 1. Landlord/Agent Image Ingestion Pipeline
- **Raw File Interception:**
  - File dropzones must intercept raw camera uploads and high-res photos before network dispatch.
- **Aspect Ratio Enforcement (`react-easy-crop`):**
  - All primary listing hero images and carousel slides must adhere strictly to a `16:10` aspect ratio.
  - Present an intuitive, touch-friendly cropping interface with zoom and rotation before finalizing selection.
- **Client-Side Compression (`browser-image-compression`):**
  - Always compress images in the browser prior to uploading to cloud storage (Cloudinary / ImageKit / S3).
  - Target constraint: `<= 400KB` per image.
  - Convert to modern WebP format where supported (`fileType: "image/webp"`).
  - Maximum dimensions capped at `1920x1200` to prevent unnecessary bandwidth consumption while maintaining crisp retina display quality.
  - Display live compression analytics to the user (e.g. `Original: 5.4MB -> Processed: 320KB`).

## 2. Triple Interactive Media Showcase
Property detail pages and quick-view showcases must provide three dedicated interactive viewing experiences:
1. **High-Res Zoomable Floor Plan & Gallery (`yet-another-react-lightbox`):**
   - High-fidelity zoom plugin for architectural blueprints and floor plans.
   - Thumbnails ribbon and keyboard navigation for full photographic walk-through.
2. **Before / After Virtual Staging Slider (`react-compare-slider`):**
   - Interactive split-slider allowing buyers and tenants to compare unfurnished / raw spaces against AI-virtually staged or renovated interiors.
3. **360-Degree Spherical Panorama (`react-photo-sphere-viewer` / `@photo-sphere-viewer/core`):**
   - Full gyroscope/drag-navigable spherical room tour.
   - Smooth inertia and zoom controls for an immersive virtual walkthrough.
