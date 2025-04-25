import settings from '../../lib/settings';
import Module from '../../lib/module';

let oldFileSizeDescriptor: PropertyDescriptor | null = null;
let oldFileTypeDescriptor: PropertyDescriptor | null = null;

class MediaBypass extends Module {
  constructor() {
    super('Media Bypass');
    settings.on('UNLIMITED_FILE_SIZE.setting:update', this.load);
    settings.on('ALLOW_VIDEO_UPLOAD.setting:update', this.load);
  }

  load = () => {
    const bypassSize = settings.getSetting('UNLIMITED_FILE_SIZE');
    const bypassType = settings.getSetting('ALLOW_VIDEO_UPLOAD');

    // === FILE SIZE BYPASS ===
    if (bypassSize && !oldFileSizeDescriptor) {
      oldFileSizeDescriptor = Object.getOwnPropertyDescriptor(File.prototype, 'size');

      Object.defineProperty(File.prototype, 'size', {
        get() {
          return 500; // or any safe mocked value
        },
      });
    } else if (!bypassSize && oldFileSizeDescriptor) {
      Object.defineProperty(File.prototype, 'size', oldFileSizeDescriptor);
      oldFileSizeDescriptor = null;
    }

    // === FILE TYPE BYPASS ===
    if (bypassType && !oldFileTypeDescriptor) {
      oldFileTypeDescriptor = Object.getOwnPropertyDescriptor(File.prototype, 'type');

      Object.defineProperty(File.prototype, 'type', {
        get() {
          const originalType = oldFileTypeDescriptor?.get?.call(this) ?? '';
          const filename = this.name?.toLowerCase?.() ?? '';

          if (filename.endsWith('.mp4') || filename.endsWith('.mov') || filename.endsWith('.avi')) {
            return 'image/jpeg'; // spoof as image
          }

          return originalType;
        },
      });
    } else if (!bypassType && oldFileTypeDescriptor) {
      Object.defineProperty(File.prototype, 'type', oldFileTypeDescriptor);
      oldFileTypeDescriptor = null;
    }
  };
}

export default new MediaBypass();

