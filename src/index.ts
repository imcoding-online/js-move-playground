import init, { version as rawVersion, ListProjects, ProjectFs, ActionOnProject, clear_cache } from "./playground.js";

export type Event = {
  type: string;
  message: string;
}

export const setup = async (opt?: { onEvent: ((event: Event) => void) }) => {
  const onEvent = opt?.onEvent ? (event: Record<string, string>) => {
    const type = Object.keys(event)[0];
    const message = event[type];
    return opt?.onEvent({
      type,
      message,
    })
  } : undefined;
  await init(onEvent);
}

export const version = async () => {
  return `v1.0.0(wrapper pontem move playground ${await rawVersion()})`
}

export const getProjects = (): Project[] => {
  const idNameMap : Record<number, string> = ListProjects.get();
  
  return Object.keys(idNameMap).map(id => new Project(parseInt(id), idNameMap[parseInt(id)]));
}

const getProjectId = (name: string) : number | undefined => {
  const id = ListProjects.name_to_id(name);
  return id;
}

export const createProject = async (name: string) : Promise<Project> => {
  if (getProjectId(name)) {
    throw new Error("project already exists");
  }

  const id: number | BigInt = await ListProjects.add(name);
  return new Project(id, name);
}

export const openProject = async (name: string) : Promise<Project> => {
  const id = getProjectId(name);
  if (!id) {
    return createProject(name);
  }
  return new Project(id, name);
}

export const clearVMCache = async () => {
  await clear_cache();
}

class Project {
  id: number;
  name: string;
  rootDirId: number = 1;
  scriptsDir: Dir;
  modulesDir: Dir;
  testsDir: Dir;

  constructor(id: number | BigInt, name: string) {
    this.id = Number(id);
    this.name = name;
    this.reloadFs();
  }

  private reloadFs() {
    const fs: Fs = ProjectFs.get(this.id);
    this.scriptsDir = this.getOrCreateDir(fs.Dir,  "scripts");
    this.testsDir = this.getOrCreateDir(fs.Dir,  "tests");
    this.modulesDir = this.getOrCreateDir(fs.Dir,  "sources");
  }

  getFs() {
    return ProjectFs.get(this.id);
  }

  private getOrCreateDir(parentDir: Dir, name: string) : Dir {
    const dir = parentDir?.list.find(fs => fs.Dir?.name === name)?.Dir;
    if (dir) return dir;

    const id = ProjectFs.add_dir(this.id, parentDir?.id || 1, name);
    return {
      id,
      name,
      list: []
    }
  }

  private openFile(parentDir: Dir, path: string) : File {
    const ps = path.split("/");
    const name = ps[ps.length - 1];
    if (ps.length > 1) {
      for (let i = 0; i < ps.length - 1; i++) {
        parentDir = this.getOrCreateDir(parentDir, ps[i]);
      }
    }

    const f = parentDir.list.find(fs => fs.File?.name === name);
    if (f?.File) return f.File;

    const id = ProjectFs.add_file(this.id, parentDir.id, name);
    this.reloadFs();
    return {
      id, 
      name,
    };
  }

  removeFile(f: File) {
    ProjectFs.remove(this.id, f.id);
  }

  clear() {
    ProjectFs.set(this.id, { Dir: { id: this.id, name: this.name, list: [] } });
  }

  renameFile(f: File, name: string): File {
    ProjectFs.rename(this.id, f.id, name);
    return {
      id: f.id,
      name,
    }
  }

  openScript(name: string) : File {
    return this.openFile(this.scriptsDir, name);
  }

  openModule(name: string) : File {
    return this.openFile(this.modulesDir, name);
  }

  openTest(name: string) : File {
    return this.openFile(this.testsDir, name);
  }

  setContent(f: File, content: string) {
    ProjectFs.set_content(this.id, f.id, content);
  }

  getContent(f: File) : string {
    return ProjectFs.get_content(this.id, f.id);
  }

  async build(): Promise<void> {
    await ActionOnProject.build(this.id);
  }

  async runScript(command: string): Promise<string> {
    return await ActionOnProject.run(this.id, command);
  }

  async remove() {
    await ListProjects.remove(this.id);
  }
}

export type Dir = {
  id: number,
  name: string,
  list: Fs[],
}

export type File = {
  id: number,
  name: string,
}

export type Fs = {
  Dir?: Dir,
  File?: File,
}