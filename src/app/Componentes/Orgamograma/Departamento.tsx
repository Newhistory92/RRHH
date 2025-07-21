import { useMemo } from 'react';
import { Building2, Star, Briefcase, ChevronsRight, PlusCircle, Pencil, X } from 'lucide-react';
import { mockEmployeesorg } from '@/app/api/Prueba';


const SkillChip = ({ skill, onRemove }) => ( <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 mb-2 px-2.5 py-1 rounded-full flex items-center">{skill}{onRemove && (<button onClick={() => onRemove(skill)} className="ml-2 text-blue-600 hover:text-blue-900"><X className="w-3 h-3" /></button>)}</span>);
const EmployeeAvatar = ({ employeeId }) => { const employee = mockEmployeesorg.find(e => e.id === employeeId); if (!employee) return null; return (<div className="flex items-center" title={employee.nombre}><img src={employee.foto} alt={employee.nombre} className="w-8 h-8 rounded-full mr-2 border-2 border-white" /><span className="text-gray-700 hidden sm:inline">{employee.nombre}</span></div>);};


export const DepartmentManagementView = ({ departmentsData, onSelect, selectedDepartment, onOpenModal }) => {
    const departmentTree = useMemo(() => {
        const tree = [];
        const map = {};
        departmentsData.forEach(dept => { map[dept.id] = { ...dept, subDepartments: [] }; });
        departmentsData.forEach(dept => { if (dept.parentId && map[dept.parentId]) { map[dept.parentId].subDepartments.push(map[dept.id]); } else { tree.push(map[dept.id]); } });
        return tree;
    }, [departmentsData]);

    const DepartmentListItem = ({ department, onSelect, selectedId, level = 0 }) => (
        <>
            <button onClick={() => onSelect(department)} className={`w-full text-left p-2 rounded-md flex items-center transition-colors ${selectedId === department.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'}`} style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}><ChevronsRight className={`w-4 h-4 mr-2 transition-transform ${selectedId === department.id ? 'rotate-90' : ''}`} />{department.nombre}</button>
            {department.subDepartments?.map(subDept => (<DepartmentListItem key={subDept.id} department={subDept} onSelect={onSelect} selectedId={selectedId} level={level + 1} />))}
        </>
    );
    
    const OfficeCard = ({ office, onEdit }) => (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 transition-shadow hover:shadow-md">
            <div className="flex justify-between items-start">
                <div><h4 className="font-bold text-lg text-gray-800 flex items-center"><Briefcase className="w-5 h-5 mr-2 text-gray-500" />{office.nombre}</h4><p className="text-sm text-gray-600 mt-1">{office.descripcion}</p></div>
                <button onClick={() => onEdit('office', office)} className="text-gray-500 hover:text-blue-600 p-1"><Pencil className="w-4 h-4" /></button>
            </div>
            <div className="mt-4"><h5 className="font-semibold text-sm mb-2">Jefe de Oficina:</h5><div className="flex items-center p-2 bg-white rounded-md">{office.jefeId ? <EmployeeAvatar employeeId={office.jefeId} /> : <span className="text-sm text-gray-500 italic">No asignado</span>}</div></div>
            <div className="mt-4">
                <h5 className="font-semibold text-sm mb-2">Empleados ({office.empleadosIds?.length || 0}):</h5>
                {(!office.empleadosIds || office.empleadosIds.length === 0) ? <span className="text-sm text-gray-500 italic">Sin empleados asignados</span> : 
                <ul className="space-y-2 pt-2">
                  {office.empleadosIds.map(id => {
                      const emp =  mockEmployeesorg.find(e => e.id === id);
                      return emp ? <li key={id} className="flex items-center text-sm"><img src={emp.foto} alt={emp.nombre} title={emp.nombre} className="w-6 h-6 rounded-full mr-3 border-2 border-gray-200" />{emp.nombre}</li> : null;
                  })}
                </ul>}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <aside className="md:w-1/3 lg:w-1/4 bg-white p-4 rounded-lg shadow-md h-fit">
                <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-gray-700">Departamentos</h2><button onClick={() => onOpenModal('department')} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Crear Nuevo Departamento"><PlusCircle className="w-6 h-6" /></button></div>
                <div className="space-y-1">{departmentTree.map(dept => <DepartmentListItem key={dept.id} department={dept} onSelect={onSelect} selectedId={selectedDepartment?.id} />)}</div>
            </aside>
            <main className="md:w-2/3 lg:w-3/4">
                {selectedDepartment ? (
                    <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
                        <div className="flex justify-between items-start mb-4">
                            <div><h2 className="text-3xl font-extrabold text-gray-900 flex items-center"><Building2 className="w-8 h-8 mr-3 text-blue-600" />{selectedDepartment.nombre}</h2><span className="text-sm bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md">Nivel Jerárquico: {selectedDepartment.nivel_jerarquico}</span></div>
                            <button onClick={() => onOpenModal('department', selectedDepartment)} className="flex items-center text-sm text-blue-600 hover:underline"><Pencil className="w-4 h-4 mr-1" /> Editar Departamento</button>
                        </div>
                        <p className="text-gray-600 mb-6">{selectedDepartment.descripcion}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div><h3 className="font-bold text-lg mb-2 flex items-center"><Star className="w-5 h-5 mr-2 text-yellow-500" />Jefe de Área</h3><div className="flex items-center bg-gray-50 p-3 rounded-lg border">{selectedDepartment.jefeId ? <EmployeeAvatar employeeId={selectedDepartment.jefeId} /> : <span className="text-gray-500 italic">No asignado</span>}</div></div>
                            <div><h3 className="font-bold text-lg mb-2">Habilidades Clave</h3><div className="flex flex-wrap gap-2">{selectedDepartment.habilidades_requeridas.map(skill => <SkillChip key={skill} skill={skill} onRemove={() => {}} />)}</div></div>
                        </div>
                        <hr className="my-6"/>
                        <div>
                            <div className="flex justify-between items-center mb-4"><h3 className="text-2xl font-bold text-gray-800">Oficinas ({selectedDepartment.oficinas.length})</h3><button onClick={() => onOpenModal('office', null, { departmentId: selectedDepartment.id })} className="flex items-center text-sm bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"><PlusCircle className="w-5 h-5 mr-2" /> Crear Oficina</button></div>
                            {selectedDepartment.oficinas.length > 0 ? (selectedDepartment.oficinas.map(office => <OfficeCard key={office.id} office={office} onEdit={onOpenModal}/>)) : (<div className="text-center py-8 px-4 bg-gray-50 rounded-lg border-2 border-dashed"><p className="mt-4 text-gray-600">Este departamento no tiene oficinas asignadas.</p></div>)}
                        </div>
                    </div>
                ) : ( <div className="flex flex-col items-center justify-center bg-white p-10 rounded-lg shadow-md h-full"><h2 className="mt-6 text-2xl font-semibold text-gray-700">Selecciona un departamento</h2></div> )}
            </main>
        </div>
    );
};
