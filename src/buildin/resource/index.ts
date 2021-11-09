export interface ImageResource {
  key: string;
  container: HTMLImageElement;
}

interface Resource {
  type: 'image';
  key: string;
  url: string;
}

export const ResourceManager = new (class ResourceManager {
  private images: Record<string, ImageResource> = {};

  public async LoadResources(resources: Resource[]): Promise<void> {
    const res: Promise<void>[] = [];

    for (const resource of resources) {
      if (resource.type === 'image') {
        res.push(this.LoadImage(resource));
      }
    }

    return Promise.all(res) as unknown as Promise<void>;
  }

  public GetImageSource(key: string): ImageResource {
    const source = this.images[key];
    if (!source) {
      throw new Error(`[wooly] ImageSource "${key}" not found.`);
    }

    return source;
  }

  private LoadImage(resource: Resource): Promise<void> {
    const { key, url } = resource;

    const container = new Image();
    this.images[key] = { key, container };

    let resolve: () => void;
    const res = new Promise<void>((r) => {
      resolve = r;
    });

    container.onload = () => resolve();
    container.src = url;

    return res;
  }
})();
