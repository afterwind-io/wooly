interface AudioResource {
  loaded: boolean;
  el: HTMLAudioElement;
}

/**
 * A simple helper to create and manage audios.
 *
 * @class Audio
 */
class Audio {
  private resources: Record<string, AudioResource> = {};

  /**
   * Load an audio file.
   *
   * An `audio` element will be created and mounted to the `body` element,
   * and its source points to the given path.
   *
   * When called, it begins to download the file instantly.
   *
   * @param {string} name The name to identify the audio.
   * @param {string} path The audio URL.
   * @memberof Audio
   */
  public Load(name: string, path: string) {
    const el = this.CreateAudioElement(name);
    this.resources[name] = {
      loaded: false,
      el
    };

    el.src = path;
  }

  /**
   * Play the audio by name.
   *
   * @param {string} name The name of an loaded audio.
   * @memberof Audio
   */
  public Play(name: string) {
    const resource = this.resources[name];
    if (!resource) {
      return console.warn(`[wooly] Audio "${name}" not found.`);
    }

    const { loaded, el } = resource;
    if (!loaded) {
      return console.warn(`[wooly] Audio "${name} not loaded, skip playback."`);
    }

    el.load();
    el.play();
  }

  private CreateAudioElement(id: string) {
    const el = document.createElement("audio");
    el.id = id;
    el.preload = "auto";
    el.addEventListener("canplaythrough", () => {
      this.OnAudioLoad(id);
    });

    return document.body.appendChild(el);
  }

  private OnAudioLoad(name: string) {
    const resource = this.resources[name];
    resource.loaded = true;
  }
}

export const _Audio = new Audio();
