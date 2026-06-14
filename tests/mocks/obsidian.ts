export class Notice {
  constructor(readonly message: string) {}
}

type MockElement = HTMLElement & {
  children: MockElement[];
  disabled?: boolean;
  inputKind?: "toggle" | "text";
  __changeListeners: Array<(value: string | boolean) => unknown>;
  setText(text: string): void;
  empty(): void;
  addClass(cls: string): void;
  appendChild(child: MockElement): MockElement;
  createDiv(options?: { cls?: string }): MockElement;
  createEl(tag: string, options?: { text?: string }): MockElement;
  click(): void;
  change(value: string | boolean): void;
};

function createMockElement(): MockElement {
  const element = {
    textContent: "",
    children: [] as MockElement[],
    __listeners: new Map<string, Array<() => unknown>>(),
    __changeListeners: [] as Array<(value: string | boolean) => unknown>,
    disabled: false,
    setText(text: string) {
      this.textContent = text;
    },
    empty() {
      this.textContent = "";
      this.children = [];
    },
    addClass() {},
    appendChild(child: MockElement) {
      this.children.push(child);
      return child;
    },
    createDiv() {
      const child = createMockElement();
      this.children.push(child);
      return child;
    },
    createEl(_tag: string, options?: { text?: string }) {
      const child = createMockElement();
      child.textContent = options?.text ?? "";
      this.children.push(child);
      return child;
    },
    addEventListener(eventName: string, handler: () => unknown) {
      const listeners = this.__listeners.get(eventName) ?? [];
      listeners.push(handler);
      this.__listeners.set(eventName, listeners);
    },
    click() {
      if (this.disabled) return;
      for (const handler of this.__listeners.get("click") ?? []) {
        handler();
      }
    },
    change(value: string | boolean) {
      for (const handler of this.__changeListeners) {
        handler(value);
      }
    }
  };

  return element as unknown as MockElement;
}

export class Plugin {
  app = {};
  __statusBarItems: HTMLElement[] = [];
  __commands: unknown[] = [];
  __settingTabs: unknown[] = [];
  __registeredIntervals: number[] = [];

  addStatusBarItem(): HTMLElement {
    const item = createMockElement();
    this.__statusBarItems.push(item);
    return item;
  }

  addCommand(command: unknown): void {
    this.__commands.push(command);
  }

  addSettingTab(tab: unknown): void {
    this.__settingTabs.push(tab);
  }

  registerInterval(intervalId: number): number {
    this.__registeredIntervals.push(intervalId);
    return intervalId;
  }

  async loadData(): Promise<unknown> {
    return null;
  }

  async saveData(_data: unknown): Promise<void> {}
}

export class Modal {
  modalEl = createMockElement();
  contentEl = createMockElement();

  constructor(readonly app: unknown) {}

  open(): void {
    this.onOpen();
  }

  close(): void {
    this.onClose();
  }

  onOpen(): void {}

  onClose(): void {}
}

export class PluginSettingTab {
  containerEl = createMockElement();

  constructor(readonly app: unknown, readonly plugin: unknown) {}

  display(): void {}
}

export class Setting {
  private readonly settingEl: MockElement;

  constructor(readonly containerEl: unknown) {
    this.settingEl = createMockElement();
    (containerEl as MockElement).appendChild(this.settingEl);
  }

  setName(name: string): this {
    this.settingEl.createEl("div", { text: name });
    return this;
  }

  setDesc(desc: string): this {
    this.settingEl.createEl("div", { text: desc });
    return this;
  }

  addToggle(callback: (toggle: { setValue(value: boolean): { onChange(handler: (value: boolean) => unknown): unknown } }) => unknown): this {
    const toggleEl = this.settingEl.createEl("input") as unknown as MockElement;
    toggleEl.inputKind = "toggle";
    callback({
      setValue: () => ({
        onChange: (handler: (value: boolean) => unknown) => {
          toggleEl.__changeListeners.push(handler as (value: string | boolean) => unknown);
          return toggleEl;
        }
      })
    });
    return this;
  }

  addText(callback: (text: {
    setPlaceholder(value: string): {
      setValue(value: string): { onChange(handler: (value: string) => unknown): unknown };
    };
    setValue(value: string): { onChange(handler: (value: string) => unknown): unknown };
  }) => unknown): this {
    const inputEl = this.settingEl.createEl("input") as unknown as MockElement;
    inputEl.inputKind = "text";
    const text = {
      setPlaceholder: () => text,
      setValue: () => ({
        onChange: (handler: (value: string) => unknown) => {
          inputEl.__changeListeners.push(handler as (value: string | boolean) => unknown);
          return inputEl;
        }
      })
    };
    callback({
      setPlaceholder: text.setPlaceholder,
      setValue: text.setValue
    });
    return this;
  }

  addButton(callback: (button: {
    setButtonText(value: string): {
      setCta(): unknown;
      setDisabled(disabled: boolean): unknown;
      onClick(handler: () => unknown): unknown;
    };
    setCta(): unknown;
    setDisabled(disabled: boolean): unknown;
    onClick(handler: () => unknown): unknown;
  }) => unknown): this {
    const buttonEl = this.settingEl.createEl("button");
    const button = {
      setButtonText: (value: string) => {
        buttonEl.setText(value);
        return button;
      },
      setCta: () => button,
      setDisabled: (disabled: boolean) => {
        buttonEl.disabled = disabled;
        return button;
      },
      onClick: (handler: () => unknown) => {
        buttonEl.addEventListener("click", handler);
        return button;
      }
    };
    callback(button);
    return this;
  }
}

export class TFile {}

export class TFolder {}

export function normalizePath(path: string): string {
  return path.replace(/\/+/g, "/").replace(/^\/|\/$/g, "");
}

type RequestUrlMock = (options: unknown) => Promise<unknown>;

let requestUrlMock: RequestUrlMock | null = null;

export function __setRequestUrlMock(mock: RequestUrlMock | null): void {
  requestUrlMock = mock;
}

export async function requestUrl(options: unknown): Promise<unknown> {
  if (!requestUrlMock) throw new Error("requestUrl mock was not configured for this test");
  return requestUrlMock(options);
}
