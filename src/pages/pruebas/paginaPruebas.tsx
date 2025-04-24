import { useState, useEffect } from "react"
import DefaultLayout from "@/config/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Permission {
  id?: number
  moduloId: number
  view: boolean
  can_create: boolean
  edit: boolean
  can_delete: boolean
}

interface Role {
  id: number
  name_rol: string
  permissions?: Permission[]
}

interface Module {
  id: number
  modulo_name: string
  description: string
}

export default function PaginaPruebasPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [permissions, setPermissions] = useState<Permission[]>([])

  useEffect(() => {
    fetchRoles()
    fetchModules()
  }, [])

  const fetchRoles = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/roles")
      const data = await response.json()
      setRoles(data)
    } catch (error) {
      toast.error("Error al cargar roles")
    }
  }

  const fetchModules = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/modules")
      const data = await response.json()
      setModules(data)
    } catch (error) {
      toast.error("Error al cargar módulos")
    }
  }

  const fetchPermissions = async (roleId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/roles/${roleId}/permissions`)
      const data = await response.json()
      setPermissions(data)
    } catch (error) {
      toast.error("Error al cargar permisos")
    }
  }

  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId)
    fetchPermissions(roleId)
  }

  const handlePermissionChange = async (moduleId: number, permission: keyof Permission, value: boolean) => {
    try {
      await fetch(`http://localhost:5000/api/auth/roles/${selectedRole}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId,
          [permission]: value
        })
      })
      
      await fetchPermissions(selectedRole)
      toast.success("Permisos actualizados")
    } catch (error) {
      toast.error("Error al actualizar permisos")
    }
  }

  const getCheckboxClass = (checked: boolean | undefined) => {
    if (checked === undefined) return ""
    return cn(
      "transition-colors",
      checked ? "!bg-green-500 hover:!bg-green-600" : "!bg-red-500 hover:!bg-red-600"
    )
  }

  return (
    <DefaultLayout>
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Roles y Permisos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <Select value={selectedRole} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name_rol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedRole && (
                <div className="border rounded-lg p-4">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left">Módulo</th>
                        <th className="text-center">Ver</th>
                        <th className="text-center">Crear</th>
                        <th className="text-center">Editar</th>
                        <th className="text-center">Eliminar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modules.map((module) => {
                        const modulePermissions = permissions.find(p => p.moduloId === module.id)
                        return (
                          <tr key={module.id} className="border-t">
                            <td className="py-4">{module.modulo_name}</td>
                            <td className="text-center">
                              <Checkbox
                                checked={modulePermissions?.view}
                                className={getCheckboxClass(modulePermissions?.view)}
                                onCheckedChange={(checked) =>
                                  handlePermissionChange(module.id, "view", checked as boolean)
                                }
                              />
                            </td>
                            <td className="text-center">
                              <Checkbox
                                checked={modulePermissions?.can_create}
                                className={getCheckboxClass(modulePermissions?.can_create)}
                                onCheckedChange={(checked) =>
                                  handlePermissionChange(module.id, "can_create", checked as boolean)
                                }
                              />
                            </td>
                            <td className="text-center">
                              <Checkbox
                                checked={modulePermissions?.edit}
                                className={getCheckboxClass(modulePermissions?.edit)}
                                onCheckedChange={(checked) =>
                                  handlePermissionChange(module.id, "edit", checked as boolean)
                                }
                              />
                            </td>
                            <td className="text-center">
                              <Checkbox
                                checked={modulePermissions?.can_delete}
                                className={getCheckboxClass(modulePermissions?.can_delete)}
                                onCheckedChange={(checked) =>
                                  handlePermissionChange(module.id, "can_delete", checked as boolean)
                                }
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DefaultLayout>
  )
}