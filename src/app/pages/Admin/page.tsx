"use client"
import { ProfileSettings, RoleEditModal, RolesGrid, UserEditModal, UsersTable } from '@/app/util/UiRRHH';
import { useState, useMemo, useEffect } from 'react';
import { UserRoundSearch } from "lucide-react";
import { InputText } from 'primereact/inputtext';
import {Usuario,Role} from '@/app/Interfas/Interfaces';




interface ApiUser {
    id: number;
    usuario: string;
    activo:boolean;
    email: string;
    roleId: number;
    role_name: string;
    employee_name: string | null;
    dni: string | null;
    gender: string | null;
    photo: string | null;
     employee_id: number;
}

interface ApiResponse {
    users: ApiUser[];
}

interface RolesApiResponse {
    roles: Role[];
}



export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<string>('active-users');
    const [users, setUsers] = useState<Usuario[]>([]);
    const [roles, setRoles] = useState<Role[]>();
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    console.log(users);
    // Estados para los modales
    const [isUserModalOpen, setUserModalOpen] = useState<boolean>(false);
    const [isRoleModalOpen, setRoleModalOpen] = useState<boolean>(false);
    const [editingUser, setEditingUser] = useState<Usuario | null>(null);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    // --- Función para obtener usuarios de la API ---
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://127.0.0.1:8000/users/');
            const data: ApiResponse = await response.json();
            console.log('Datos de usuarios recibidos de la API:', data);
            // Mapear los datos de la API al formato de la aplicación
            const mappedUsers: Usuario[] = data.users.map((apiUser) => ({
                id: apiUser.id,
                name: apiUser.employee_name || 'No especificado',
                usuario: apiUser.usuario,
                dni: apiUser.dni || 'N/A',
                gender: apiUser.gender || 'No especificado',
                email: apiUser.email,
                role: apiUser.role_name,
                activo:apiUser.activo,
                avatar: apiUser.photo || `https://i.pravatar.cc/150?u=${apiUser.email}`,
                 employee_id: apiUser.employee_id,
            }));
            
            setUsers(mappedUsers);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            // En caso de error, mantener el estado actual
        } finally {
            setLoading(false);
        }
    };

    // Cargar usuarios al montar el componente
    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://127.0.0.1:8000/roles/');
            const data: RolesApiResponse = await response.json();
            setRoles(data.roles);
        } catch (error) {
            console.error('Error al cargar roles:', error);
        } finally {
           setLoading(false);
        }
    };
    // Memoizar usuarios filtrados para optimizar el rendimiento
    const filteredUsers = useMemo(() => 
        users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase())
        ), [users, searchTerm]);

    // --- Filtrado por estado ---
const activeUsers = filteredUsers.filter(user => user.activo === true);
const inactiveUsers = filteredUsers.filter(user => user.activo === false);

// --- Manejador de cambio de estado ---
const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
  try {
    // Calculamos el nuevo estado
    const newStatus = !currentStatus;

    // Llamada al backend
    const response = await fetch(`http://127.0.0.1:8000/users/${userId}/activo`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: newStatus })
    });

    if (!response.ok) throw new Error('Error actualizando estado');

    // Actualizamos localmente
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, activo: newStatus } : u))
    );
  } catch (error) {
    console.error('No se pudo actualizar el estado:', error);
  }
};



    // --- Funciones para Modales ---
    const openUserModal = (user: Usuario) => {
        setEditingUser(user);
        setUserModalOpen(true);
    };

    const closeUserModal = () => {
        setUserModalOpen(false);
        setEditingUser(null);
    };

const handleUserUpdate = async (formData: {
  name: string;
  dni: string;
  gender: string;
}) => {
  if (!editingUser) return;
  console.log(formData);

  try {
    // Si tiene employee_id, es PUT (actualizar), si no, es POST (crear)
    const method = editingUser.employee_id ? 'PUT' : 'POST';
    console.log(`Usando método ${method} para empleado`);
    const employeeResponse = await fetch("http://127.0.0.1:8000/users/employee", {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dni: formData.dni,
        name: formData.name,
        gender: formData.gender,
        email: editingUser.email,
        user_id: editingUser.id,
        employee_id: editingUser.employee_id || undefined,
      }),
    });

    if (!employeeResponse.ok) {
      throw new Error(`Error al ${method === 'PUT' ? 'actualizar' : 'crear'} empleado`);
    }

    await fetchUsers();
    closeUserModal();
    console.log(`Empleado ${method === 'PUT' ? 'actualizado' : 'creado'} correctamente ✅`);
  } catch (error) {
    console.error("❌ Error al procesar empleado:", error);
  }
};


 const handleRoleEmployeUpdate = async (userId: number, role: string) => {
    console.log(role)
        try {
            const response = await fetch(`http://127.0.0.1:8000/users/${userId}/role`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role }),
            });

            if (!response.ok) throw new Error("Error al actualizar rol");
        closeUserModal();
            console.log("Rol actualizado correctamente ✅");
        } catch (error) {
            console.error("Error al actualizar rol:", error);
        }
    };

    const openRoleModal = (role: Role | null) => {
        setEditingRole(role || { id: 0, name: '', description: '', color: 'purple' });
        setRoleModalOpen(true);
    };
    
    const closeRoleModal = () => {
        setRoleModalOpen(false);
        setEditingRole(null);
    };

      const handleRoleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const editRoleName = form.elements.namedItem('editRoleName') as HTMLInputElement;
        const editRoleDescription = form.elements.namedItem('editRoleDescription') as HTMLTextAreaElement;
        const editRoleId = form.elements.namedItem('editRoleId') as HTMLInputElement;
        
        const roleId = editRoleId.value;
        const roleData = { 
            name: editRoleName.value, 
            description: editRoleDescription.value,
            color: 'purple' // Default color
        };

        try {
            if (roleId && parseInt(roleId)) {
                // Actualizar rol existente
                const response = await fetch(`http://127.0.0.1:8000/roles/${roleId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(roleData)
                });
                
                if (response.ok) {
                    await fetchRoles(); // Recargar roles
                }
            } else {
                // Crear nuevo rol
                const response = await fetch('http://127.0.0.1:8000/roles/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(roleData)
                });
                
                if (response.ok) {
                    await fetchRoles(); // Recargar roles
                }
            }
            closeRoleModal();
        } catch (error) {
            console.error('Error al guardar rol:', error);
        }
    };


    const TabButton = ({ id, title }: { id: string; title: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id
                    ? 'border-[#2ecbe7] text-[#2ecbe7] bg-cyan-500/10'
                    : 'border-transparent text-gray-400 hover:text-white'
            }`}
        >
            {title}
        </button>
    );

    return (
        <div className="bg-gray-900 text-gray-200 antialiased min-h-screen">
            <style jsx global>{`
                body { font-family: 'Inter', sans-serif; }
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: #1f2937; }
                ::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: #6b7280; }
            `}</style>

            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Panel de Administración</h1>
                    <p className="text-gray-400 mt-1">Gestiona usuarios, roles y perfiles de la aplicación.</p>
                </header>

                <main className="bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6">
                    <div className="border-b border-gray-700">
                        <nav className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto">
                           <TabButton id="active-users" title="Usuarios Activos" />
                           <TabButton id="inactive-users" title="Usuarios Inactivos" />
                           <TabButton id="roles" title="Configuración de Roles" />
                           <TabButton id="profiles" title="Perfiles de Usuario" />
                        </nav>
                    </div>
                    
                    <div className="mt-6">
                        {activeTab === 'active-users' && (
                            <div>
                                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                                    <h2 className="text-xl font-semibold text-white">Listado de Usuarios Activos</h2>
                                    <div className="relative w-full sm:w-auto">
                                        <span className="p-input-icon-left w-full">
                                            <UserRoundSearch className="absolute left-3 top-1/2 -translate-y-1/2  text-gray-400" size={20} />
                                            <InputText 
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Buscar por nombre o depto..."
                                                className="w-full pl-10 bg-gray-700 border-gray-600 text-gray-200"
                                                style={{ paddingLeft: '3rem' }}
                                            />
                                        </span>
                                    </div>
                                </div>
                                {loading ? (
                                    <div className="text-center py-8 text-gray-400">Cargando usuarios...</div>
                                ) : (
                                    <UsersTable users={activeUsers} onEdit={openUserModal} onToggleStatus={(userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) handleToggleUserStatus(userId, user.activo);
  }} />
                                )}
                            </div>
                        )}
                        {activeTab === 'inactive-users' && (
                            <div>
                                <h2 className="text-xl font-semibold text-white mb-4">Listado de Usuarios Inactivos</h2>
                                <UsersTable users={inactiveUsers} onToggleStatus={(userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) handleToggleUserStatus(userId, user.activo);
  }} />
                            </div>
                        )}{activeTab === 'roles' && <RolesGrid roles={roles ?? []} onEdit={openRoleModal} />}
                        {activeTab === 'profiles' && <ProfileSettings />}
                    </div>
                </main>
            </div>
            
            {isUserModalOpen && editingUser && <UserEditModal user={editingUser}  roles={roles ?? []} onClose={closeUserModal} onSave={handleUserUpdate}   onRoleChange={handleRoleEmployeUpdate} />}
             {isRoleModalOpen && editingRole && <RoleEditModal role={editingRole} onClose={closeRoleModal} onSave={handleRoleUpdate} />}
        </div>
    );
}