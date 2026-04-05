import { Request, Response } from 'express';
import { platformService } from './platform.service';

class PlatformController {
  public async enableMusic(_req: Request, res: Response) {
    const settings = await platformService.setMusicEnabled(true);
    res.status(200).json({
      data: {
        musicEnabled: settings.musicEnabled,
        updatedAt: settings.updatedAt
      }
    });
  }

  public async disableMusic(_req: Request, res: Response) {
    const settings = await platformService.setMusicEnabled(false);
    res.status(200).json({
      data: {
        musicEnabled: settings.musicEnabled,
        updatedAt: settings.updatedAt
      }
    });
  }
}

export const platformController = new PlatformController();
