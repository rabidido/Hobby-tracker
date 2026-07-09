import { useEffect, useState } from 'react';
import { useCollection } from './hooks/useCollection';
import { Home } from './components/Home';
import { ProjectView } from './components/ProjectView';
import { AddProjectSheet } from './components/AddProjectSheet';

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

  const [openId, setOpenId] = useState<string | null>(null);
  const [addProjectOpen, setAddProjectOpen] = useState(false);

  const activeProject = projects.find((p) => p.id === openId) ?? null;

  // If the open army is deleted (or never existed), fall back to the overview.
  useEffect(() => {
    if (openId && !activeProject) setOpenId(null);
  }, [openId, activeProject]);

  if (activeProject) {
    return (
      <ProjectView
        project={activeProject}
        projects={projects}
        units={units}
        onBack={() => setOpenId(null)}
        onAddUnit={addUnit}
        onUpdateUnit={updateUnit}
        onRemoveUnit={removeUnit}
        onSetStatus={setStatus}
        onUpdateProject={updateProject}
        onRemoveProject={removeProject}
      />
    );
  }

  return (
    <>
      <Home
        projects={projects}
        units={units}
        onOpen={setOpenId}
        onAddProject={() => setAddProjectOpen(true)}
      />
      {addProjectOpen && (
        <AddProjectSheet
          onClose={() => setAddProjectOpen(false)}
          onCreate={(name, faction) => {
            const id = addProject(name, faction);
            setAddProjectOpen(false);
            setOpenId(id);
          }}
        />
      )}
    </>
  );
}
