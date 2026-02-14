"use client";

interface Machine {
  name: string;
  group_name: string;
  group_id: string;
}

interface Group {
  id: string;
  name: string;
}

interface MachineListProps {
  groups: Group[];
  machines: Machine[];
  selectedMachine: string | null;
  onSelectMachine: (name: string) => void;
}

export const MachineList = ({
  groups,
  machines,
  selectedMachine,
  onSelectMachine,
}: MachineListProps) => {
  const machinesByGroup = machines.reduce(
    (acc, machine) => {
      const groupId = machine.group_id;
      if (groupId) {
        if (!acc[groupId]) acc[groupId] = [];
        acc[groupId].push(machine);
      }
      return acc;
    },
    {} as Record<string, Machine[]>,
  );

  return (
    <aside className="col-start-1 row-span-2 bg-white rounded-[20px] p-5 flex flex-col overflow-y-auto w-[200px] shrink-0">
      {groups.map((group, groupIndex) => {
        const groupMachines = machinesByGroup[group.id] || [];
        const isFirstGroup = groupIndex === 0;
        const isLastGroup = groupIndex === groups.length - 1;
        const hasNoMachines = groupMachines.length === 0;

        return (
          <div key={group.id} className="flex flex-col mb-0">
            {/* Group Header */}
            <button
              className={`w-full p-[10px] bg-[#2b5a7a] text-white font-semibold text-center text-sm
                ${isFirstGroup ? "rounded-t-[8px]" : ""}
                ${isLastGroup && hasNoMachines ? "rounded-b-[8px]" : ""}
              `}
            >
              {group.name}
            </button>

            {/* Machine Items */}
            {groupMachines.map((machine, machineIndex) => {
              const isLastMachine = machineIndex === groupMachines.length - 1;
              const isLastOverall = isLastGroup && isLastMachine;
              const isActive = selectedMachine === machine.name;

              return (
                <button
                  key={machine.name}
                  onClick={() => onSelectMachine(machine.name)}
                  className={`w-full p-2 text-center text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-[#3ba99c] text-white"
                        : "bg-[#dce7ea] text-[#486887] hover:bg-[#e8f4f8]"
                    }
                    ${isLastOverall ? "rounded-b-[8px]" : "rounded-none"}
                  `}
                >
                  {machine.name}
                </button>
              );
            })}
          </div>
        );
      })}
    </aside>
  );
};
