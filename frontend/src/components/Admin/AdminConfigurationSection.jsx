import { Building2, Layers3, LifeBuoy, Plus, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { adminConfigService } from "../../services/adminConfigService";

const tabs = [
  { id: "buildings", label: "Buildings", icon: Building2 },
  { id: "request-types", label: "Request Types", icon: Layers3 },
  { id: "support-categories", label: "Support Categories", icon: LifeBuoy },
];

const formInputClass =
  "rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30";

const surfaceClass =
  "rounded-[1.15rem] border border-gray-100 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/55";

const EditableBuildingRow = ({ building, onSave, saving }) => {
  const [form, setForm] = useState(() => ({
    name: building.name,
    code: building.code,
    floors: building.floors,
    active: building.active,
    sortOrder: building.sortOrder,
  }));

  return (
    <div className={surfaceClass}>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_150px_120px_120px_110px]">
        <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className={formInputClass} placeholder="Building name" />
        <input value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} className={formInputClass} placeholder="Code" />
        <input type="number" min="1" value={form.floors} onChange={(event) => setForm((current) => ({ ...current, floors: Number(event.target.value) }))} className={formInputClass} placeholder="Floors" />
        <input type="number" min="0" value={form.sortOrder} onChange={(event) => setForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))} className={formInputClass} placeholder="Order" />
        <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
          <span>Active</span>
          <input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} />
        </label>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          ID #{building.id} {building.active ? "" : "| Hidden from new ticket forms"}
        </p>
        <button
          type="button"
          disabled={saving}
          onClick={() => onSave(building.id, form)}
          className="btn-primary interactive-control"
        >
          <Save size={15} />
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

const EditableRequestTypeRow = ({ requestType, onSave, saving }) => {
  const [form, setForm] = useState(() => ({
    label: requestType.label,
    active: requestType.active,
    sortOrder: requestType.sortOrder,
  }));

  return (
    <div className={surfaceClass}>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1.6fr)_140px_110px]">
        <input value={form.label} onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))} className={formInputClass} placeholder="Request type label" />
        <input type="number" min="0" value={form.sortOrder} onChange={(event) => setForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))} className={formInputClass} placeholder="Order" />
        <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
          <span>Active</span>
          <input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} />
        </label>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {requestType.serviceDomainLabel} | ID #{requestType.id}
        </p>
        <button
          type="button"
          disabled={saving}
          onClick={() => onSave(requestType.id, form)}
          className="btn-primary interactive-control"
        >
          <Save size={15} />
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

const EditableSupportCategoryRow = ({ supportCategory, onSave, saving }) => {
  const [form, setForm] = useState(() => ({
    label: supportCategory.label,
    active: supportCategory.active,
    sortOrder: supportCategory.sortOrder,
  }));

  return (
    <div className={surfaceClass}>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1.6fr)_140px_110px]">
        <input value={form.label} onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))} className={formInputClass} placeholder="Support category label" />
        <input type="number" min="0" value={form.sortOrder} onChange={(event) => setForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))} className={formInputClass} placeholder="Order" />
        <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
          <span>Active</span>
          <input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} />
        </label>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500 dark:text-gray-400">ID #{supportCategory.id}</p>
        <button
          type="button"
          disabled={saving}
          onClick={() => onSave(supportCategory.id, form)}
          className="btn-primary interactive-control"
        >
          <Save size={15} />
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export const AdminConfigurationSection = ({
  buildings,
  serviceDomains,
  requestTypes,
  supportCategories,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState("buildings");
  const [createBuildingForm, setCreateBuildingForm] = useState({
    name: "",
    code: "",
    floors: 1,
    sortOrder: buildings.length,
  });
  const [createRequestTypeForm, setCreateRequestTypeForm] = useState({
    serviceDomainKey: serviceDomains[0]?.key || "",
    label: "",
    sortOrder: 0,
  });
  const [createSupportCategoryForm, setCreateSupportCategoryForm] = useState({
    label: "",
    sortOrder: supportCategories.length,
  });
  const [savingKey, setSavingKey] = useState("");
  const [savedBuildingIds, setSavedBuildingIds] = useState(() => new Set());
  const [savedBuildingCodes, setSavedBuildingCodes] = useState(() => new Set());
  const [showSavedBuildings, setShowSavedBuildings] = useState(false);

  useEffect(() => {
    setCreateBuildingForm((current) => ({ ...current, sortOrder: buildings.length }));
  }, [buildings.length]);

  useEffect(() => {
    setCreateRequestTypeForm((current) => ({
      ...current,
      serviceDomainKey: current.serviceDomainKey || serviceDomains[0]?.key || "",
    }));
  }, [serviceDomains]);

  useEffect(() => {
    setCreateSupportCategoryForm((current) => ({ ...current, sortOrder: supportCategories.length }));
  }, [supportCategories.length]);

  const requestTypesByDomain = useMemo(
    () => serviceDomains.map((domain) => ({
      domain,
      items: requestTypes.filter((requestType) => requestType.serviceDomainKey === domain.key),
    })),
    [requestTypes, serviceDomains]
  );
  const visibleBuildings = useMemo(
    () => showSavedBuildings
      ? buildings
      : buildings.filter((building) => (
        !savedBuildingIds.has(building.id)
        && !savedBuildingCodes.has(String(building.code || "").trim().toUpperCase())
      )),
    [buildings, savedBuildingCodes, savedBuildingIds, showSavedBuildings]
  );
  const hiddenSavedBuildingCount = buildings.length - visibleBuildings.length;

  const saveBuilding = async (id, form) => {
    setSavingKey(`building-${id}`);
    try {
      await adminConfigService.updateBuilding(id, form);
      setSavedBuildingIds((current) => new Set(current).add(id));
      setSavedBuildingCodes((current) => new Set(current).add(String(form.code || "").trim().toUpperCase()));
      toast.success("Building updated.");
      await onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update building.");
    } finally {
      setSavingKey("");
    }
  };

  const createBuilding = async () => {
    setSavingKey("create-building");
    try {
      const createdBuilding = await adminConfigService.createBuilding(createBuildingForm);
      if (createdBuilding?.id) {
        setSavedBuildingIds((current) => new Set(current).add(createdBuilding.id));
      }
      setSavedBuildingCodes((current) => new Set(current).add(String(createBuildingForm.code || "").trim().toUpperCase()));
      toast.success("Building created.");
      setCreateBuildingForm({ name: "", code: "", floors: 1, sortOrder: buildings.length + 1 });
      await onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create building.");
    } finally {
      setSavingKey("");
    }
  };

  const saveRequestType = async (id, form) => {
    setSavingKey(`request-type-${id}`);
    try {
      await adminConfigService.updateRequestType(id, form);
      toast.success("Request type updated.");
      await onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update request type.");
    } finally {
      setSavingKey("");
    }
  };

  const createRequestType = async () => {
    setSavingKey("create-request-type");
    try {
      await adminConfigService.createRequestType(createRequestTypeForm);
      toast.success("Request type created.");
      setCreateRequestTypeForm((current) => ({ ...current, label: "", sortOrder: 0 }));
      await onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create request type.");
    } finally {
      setSavingKey("");
    }
  };

  const saveSupportCategory = async (id, form) => {
    setSavingKey(`support-category-${id}`);
    try {
      await adminConfigService.updateSupportCategory(id, form);
      toast.success("Support category updated.");
      await onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update support category.");
    } finally {
      setSavingKey("");
    }
  };

  const createSupportCategory = async () => {
    setSavingKey("create-support-category");
    try {
      await adminConfigService.createSupportCategory(createSupportCategoryForm);
      toast.success("Support category created.");
      setCreateSupportCategoryForm({ label: "", sortOrder: supportCategories.length + 1 });
      await onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create support category.");
    } finally {
      setSavingKey("");
    }
  };

  return (
    <div className="space-y-0">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Configuration</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Manage buildings and service catalogs without touching code or redeploying the platform.
          </p>
        </div>
        <span className="pill-badge bg-campus-50 text-campus-700 dark:bg-campus-900/20 dark:text-campus-300">
          {buildings.length} buildings | {requestTypes.length} request types | {supportCategories.length} support categories
        </span>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`interactive-control rounded-xl px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-campus-500 text-white shadow-sm shadow-campus-500/20"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-campus-300 hover:text-campus-600 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-300 dark:hover:border-campus-500 dark:hover:text-campus-300"
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon size={15} />
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {activeTab === "buildings" && (
        <div className="space-y-4">
          <div className={surfaceClass}>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Add building</h4>
            <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1.4fr)_160px_140px_140px_auto]">
              <input value={createBuildingForm.name} onChange={(event) => setCreateBuildingForm((current) => ({ ...current, name: event.target.value }))} className={formInputClass} placeholder="Building name" />
              <input value={createBuildingForm.code} onChange={(event) => setCreateBuildingForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} className={formInputClass} placeholder="Code" />
              <input type="number" min="1" value={createBuildingForm.floors} onChange={(event) => setCreateBuildingForm((current) => ({ ...current, floors: Number(event.target.value) }))} className={formInputClass} placeholder="Floors" />
              <input type="number" min="0" value={createBuildingForm.sortOrder} onChange={(event) => setCreateBuildingForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))} className={formInputClass} placeholder="Order" />
              <button type="button" onClick={createBuilding} disabled={savingKey === "create-building"} className="btn-primary interactive-control">
                <Plus size={15} />
                {savingKey === "create-building" ? "Creating..." : "Add"}
              </button>
            </div>
          </div>

          {hiddenSavedBuildingCount > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200">
              <span>
                {hiddenSavedBuildingCount} saved {hiddenSavedBuildingCount === 1 ? "building is" : "buildings are"} hidden from this editor.
              </span>
              <button
                type="button"
                onClick={() => setShowSavedBuildings((current) => !current)}
                className="font-semibold text-campus-700 hover:text-campus-800 dark:text-campus-300 dark:hover:text-campus-200"
              >
                {showSavedBuildings ? "Hide saved buildings" : "Show saved buildings"}
              </button>
            </div>
          ) : null}

          <div className="space-y-3">
            {visibleBuildings.map((building) => (
              <EditableBuildingRow
                key={`${building.id}-${building.name}-${building.code}-${building.floors}-${building.sortOrder}-${building.active}`}
                building={building}
                onSave={saveBuilding}
                saving={savingKey === `building-${building.id}`}
              />
            ))}
            {visibleBuildings.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/55 dark:text-slate-300">
                No unsaved building rows are visible. Use "Show saved buildings" if you need to edit one again.
              </p>
            ) : null}
          </div>
        </div>
      )}

      {activeTab === "request-types" && (
        <div className="space-y-4">
          <div className={surfaceClass}>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Add request type</h4>
            <div className="mt-3 grid gap-3 md:grid-cols-[180px_minmax(0,1.4fr)_140px_auto]">
              <select value={createRequestTypeForm.serviceDomainKey} onChange={(event) => setCreateRequestTypeForm((current) => ({ ...current, serviceDomainKey: event.target.value }))} className={formInputClass}>
                {serviceDomains.map((domain) => (
                  <option key={domain.id} value={domain.key}>
                    {domain.label}
                  </option>
                ))}
              </select>
              <input value={createRequestTypeForm.label} onChange={(event) => setCreateRequestTypeForm((current) => ({ ...current, label: event.target.value }))} className={formInputClass} placeholder="Request type label" />
              <input type="number" min="0" value={createRequestTypeForm.sortOrder} onChange={(event) => setCreateRequestTypeForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))} className={formInputClass} placeholder="Order" />
              <button type="button" onClick={createRequestType} disabled={savingKey === "create-request-type"} className="btn-primary interactive-control">
                <Plus size={15} />
                {savingKey === "create-request-type" ? "Creating..." : "Add"}
              </button>
            </div>
          </div>

          <div className="space-y-5">
            {requestTypesByDomain.map(({ domain, items }) => (
              <div key={domain.id} className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400 dark:text-slate-500">{domain.label}</p>
                </div>
                {items.length === 0 ? (
                  <div className={surfaceClass}>
                    <p className="text-sm text-gray-500 dark:text-gray-400">No request types in this domain yet.</p>
                  </div>
                ) : (
                  items.map((requestType) => (
                    <EditableRequestTypeRow
                      key={`${requestType.id}-${requestType.label}-${requestType.sortOrder}-${requestType.active}`}
                      requestType={requestType}
                      onSave={saveRequestType}
                      saving={savingKey === `request-type-${requestType.id}`}
                    />
                  ))
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "support-categories" && (
        <div className="space-y-4">
          <div className={surfaceClass}>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Add support category</h4>
            <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1.6fr)_140px_auto]">
              <input value={createSupportCategoryForm.label} onChange={(event) => setCreateSupportCategoryForm((current) => ({ ...current, label: event.target.value }))} className={formInputClass} placeholder="Support category label" />
              <input type="number" min="0" value={createSupportCategoryForm.sortOrder} onChange={(event) => setCreateSupportCategoryForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))} className={formInputClass} placeholder="Order" />
              <button type="button" onClick={createSupportCategory} disabled={savingKey === "create-support-category"} className="btn-primary interactive-control">
                <Plus size={15} />
                {savingKey === "create-support-category" ? "Creating..." : "Add"}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {supportCategories.map((supportCategory) => (
              <EditableSupportCategoryRow
                key={`${supportCategory.id}-${supportCategory.label}-${supportCategory.sortOrder}-${supportCategory.active}`}
                supportCategory={supportCategory}
                onSave={saveSupportCategory}
                saving={savingKey === `support-category-${supportCategory.id}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
