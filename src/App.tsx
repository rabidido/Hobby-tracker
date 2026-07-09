import { useEffect } from 'react';
import { useCollection } from './hooks/useCollection';
import { useNav, type SheetState } from './hooks/useNav';
import { Home } from './components/Home';
import { ProjectView } from './components/ProjectView';
import { AddProjectSheet } from './components/AddProjectSheet';
import { AddUnitSheet } from './components/AddUnitSheet';
import { EditUnitSheet } from './components/EditUnitSheet';
import { EditProjectSheet } from './components/EditProjectSheet';

export default function App() {
  const {
    projects,
    units,
    addProject,
    updateProject,
    removeProject,
    addUnit,
    updateUnit,
    removeUnit,
    setStatus,
  } = useCollection();

  const { loc, push, replace, back } = useNav();

  const activeProject = loc.projectId
    ? (projects.find((p) => p.id === loc.projectId) ?? null)
    : null;

  // If the located army no longer exists (e.g. deleted, or a stale forward
  // entry), reconcile the current entry back to Home so history stays sane.
  useEffect(() => {
    if (loc.projectId && !activeProject) replace({ projectId: null, sheet: null });
  }, [loc.projectId, activeProject, replace]);

  const openProject = (id: string) => push({ projectId: id, sheet: null });
  const openSheet = (sheet: SheetState) => push({ ...loc, sheet });
  const closeSheet = () => back();

  // Create then enter the new army, replacing the "add army" sheet entry so a
  // single Back goes from the army straight to Home.
  const createProject = (name: string, faction: string) => {
    const id = addProject(name, faction);
    replace({ projectId: id, sheet: null });
  };

  const sheet = loc.sheet;
  const sheetUnit =
    sheet?.kind === 'editUnit' ? (units.find((u) => u.id === sheet.unitId) ?? null) : null;
  const sheetProject =
    sheet?.kind === 'addUnit' || sheet?.kind === 'editProject'
      ? (projects.find((p) => p.id === sheet.projectId) ?? null)
      : null;

  return (
    <>
      {activeProject ? (
        <ProjectView
          project={activeProject}
          units={units}
          onBack={back}
          onSetStatus={setStatus}
          onAddUnit={() => openSheet({ kind: 'addUnit', projectId: activeProject.id })}
          onEditUnit={(u) => openSheet({ kind: 'editUnit', unitId: u.id })}
          onOpenSettings={() => openSheet({ kind: 'editProject', projectId: activeProject.id })}
        />
      ) : (
        <Home
          projects={projects}
          units={units}
          onOpen={openProject}
          onAddProject={() => openSheet({ kind: 'addProject' })}
        />
      )}

      {sheet?.kind === 'addProject' && (
        <AddProjectSheet onClose={closeSheet} onCreate={createProject} />
      )}
      {sheet?.kind === 'addUnit' && sheetProject && (
        <AddUnitSheet project={sheetProject} onClose={closeSheet} onAdd={addUnit} />
      )}
      {sheet?.kind === 'editUnit' && sheetUnit && (
        <EditUnitSheet
          unit={sheetUnit}
          projects={projects}
          onClose={closeSheet}
          onSave={updateUnit}
          onDelete={removeUnit}
        />
      )}
      {sheet?.kind === 'editProject' && sheetProject && (
        <EditProjectSheet
          project={sheetProject}
          onClose={closeSheet}
          onSave={updateProject}
          onDelete={removeProject}
        />
      )}
    </>
  );
}
