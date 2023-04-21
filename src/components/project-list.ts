/// <reference path="./base.ts"/>
/// <reference path="../decorators/autobind.ts"/>
/// <reference path="../state/project.ts"/>
/// <reference path="../models/project.ts"/>
/// <reference path="../models/drag-drop.ts"/>

namespace App {
  export class ProjectList
    extends Component<HTMLDivElement, HTMLElement>
    implements DragTarget
  {
    assignProjects: Project[];

    constructor(private type: 'active' | 'finished') {
      super('project-list', 'app', false, `${type}-projects`);
      this.assignProjects = [];
      this.configure();
      this.renderContent();
    }

    @autobind
    dragOverHandler(event: DragEvent): void {
      if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
        event.preventDefault();
        const listEl = this.element.querySelector('ul')!;
        listEl.classList.add('droppable');
      }
    }

    @autobind
    dropHandler(event: DragEvent): void {
      const prjId = event.dataTransfer!.getData('text/plain');
      projectSate.moveProject(
        prjId,
        this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished
      );
      const listEl = this.element.querySelector('ul')!;
      listEl.classList.remove('droppable');
    }

    @autobind
    dragLeaveHandler(_: DragEvent): void {
      const listEl = this.element.querySelector('ul')!;
      listEl.classList.remove('droppable');
    }

    private renderProjects() {
      const listEl = <HTMLUListElement>(
        document.getElementById(`${this.type}-projects-list`)!
      );
      listEl.innerHTML = '';
      for (const prjItem of this.assignProjects) {
        new ProjectItem(this.element.querySelector('ul')!.id, prjItem);
      }
    }

    renderContent() {
      const listId = `${this.type}-projects-list`;
      this.element.querySelector('ul')!.id = listId;
      this.element.querySelector('h2')!.textContent =
        this.type.toUpperCase() + ' PROJECTS';
    }

    configure(): void {
      this.element.addEventListener('dragover', this.dragOverHandler);
      this.element.addEventListener('dragleave', this.dragLeaveHandler);
      this.element.addEventListener('drop', this.dropHandler);

      projectSate.addListener((projects: Project[]) => {
        const relevantProjects = projects.filter((prj) => {
          if (this.type === 'active') {
            return prj.status === ProjectStatus.Active;
          }
          return prj.status === ProjectStatus.Finished;
        });
        this.assignProjects = relevantProjects;
        this.renderProjects();
      });
    }
  }
}
