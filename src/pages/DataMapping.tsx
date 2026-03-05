import { useState } from "react";
import { DataMappingProvider } from "@/components/settings/data-mapping/DataMappingContext";
import MappingProfilesList from "@/components/settings/data-mapping/MappingProfilesList";
import MappingWizard from "@/components/settings/data-mapping/MappingWizard";
import MappingProfileView from "@/components/settings/data-mapping/MappingProfileView";
import type { MappingProfile } from "@/components/settings/data-mapping/types";

type View = "list" | "create" | "edit" | "view";

function DataMappingInner() {
  const [view, setView] = useState<View>("list");
  const [selectedProfile, setSelectedProfile] = useState<MappingProfile | null>(null);

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold">Data Mapping</h1>

      {view === "list" && (
        <MappingProfilesList
          onCreateNew={() => { setSelectedProfile(null); setView("create"); }}
          onEdit={(p) => { setSelectedProfile(p); setView("edit"); }}
          onView={(p) => { setSelectedProfile(p); setView("view"); }}
        />
      )}

      {view === "create" && (
        <MappingWizard
          onDone={() => setView("list")}
          onCancel={() => setView("list")}
        />
      )}

      {view === "edit" && selectedProfile && (
        <MappingWizard
          existingProfile={selectedProfile}
          onDone={() => setView("list")}
          onCancel={() => setView("list")}
        />
      )}

      {view === "view" && selectedProfile && (
        <MappingProfileView
          profile={selectedProfile}
          onBack={() => setView("list")}
          onEdit={() => setView("edit")}
        />
      )}
    </div>
  );
}

export default function DataMapping() {
  return (
    <DataMappingProvider>
      <DataMappingInner />
    </DataMappingProvider>
  );
}
