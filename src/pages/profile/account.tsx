import { useEffect, useState } from "react";
import DefaultLayout from "@/config/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import "@/styles/account.css";

interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  name: string;
  last_name?: string;
  phone?: string;
  role_name?: string;
  team_name?: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [banner, setBanner] = useState<string>("/banners/default-banner.jpg");
  const [isHovered, setIsHovered] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    last_name: "",
    phone: "",
  });
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    newEmail: "",
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      setProfileForm({
        name: userData.name || "",
        last_name: userData.last_name || "",
        phone: userData.phone || "",
      });
    }
  }, []);

  const uploadImage = async (file: File, type: 'avatar' | 'banner') => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(
        `http://localhost:5000/api/upload/user/${user?.id}/upload?type=${type}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) throw new Error('Error uploading image');

      const updatedUser = await response.json();
      setUser(updatedUser);
      
      if (type === 'banner') {
        setBanner(updatedUser.banner_url);
      }

      // Actualizar el localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadImage(file, 'avatar');
    }
  };

  const handleBannerChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadImage(file, 'banner');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });

      if (!response.ok) throw new Error('Error actualizando perfil');
      
      const updatedUser = await response.json();
      setUser(prev => ({ ...prev, ...updatedUser }));
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/${user?.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: securityForm.currentPassword,
          newPassword: securityForm.newPassword,
        }),
      });

      if (!response.ok) throw new Error('Error cambiando contraseña');
      
      setSecurityForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        newEmail: "",
      });
      toast.success('Contraseña actualizada correctamente');
    } catch (error) {
      toast.error('Error al actualizar la contraseña');
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user?.id}/email`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: securityForm.newEmail }),
      });

      if (!response.ok) throw new Error('Error cambiando email');
      
      const updatedUser = await response.json();
      setUser(prev => ({ ...prev, ...updatedUser }));
      setSecurityForm(prev => ({ ...prev, newEmail: "" }));
      toast.success('Email actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar el email');
    }
  };

  return (
    <DefaultLayout>
      <div className="relative">
        <Card className="w-full h-60 overflow-hidden">
          {/* Banner */}
          <div 
            className="absolute inset-0 bg-cover bg-center banner-account"
            style={{ backgroundImage: `url(${banner})` }}
          >
            <div className="absolute inset-0 bg-black/30" />
          </div>
          
          {/* Botón cambiar banner */}
          <div className="absolute top-4 right-4">
            <Label htmlFor="banner-upload" className="cursor-pointer">
              <div className="bg-black/50 text-white p-2 rounded-lg hover:bg-black/70 transition flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Cambiar banner
              </div>
            </Label>
            <Input 
              id="banner-upload" 
              type="file" 
              accept="image/*" 
              className="hidden"
              onChange={handleBannerChange}
            />
          </div>

          {/* Contenido perfil */}
          <div className="relative h-full flex items-center p-6">
            <div className="flex flex-row items-center gap-6 text-white z-10">
              {/* Avatar con botón de cambio */}
              <div 
                className="relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <Avatar className="h-32 w-32 border-4 border-white">
                  <AvatarImage src={user?.avatar || "/avatars/default.png"} />
                  <AvatarFallback>{user?.username?.[0]}</AvatarFallback>
                </Avatar>
                <Label 
                  htmlFor="avatar-upload"
                  className={`absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer transition
                    ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                >
                  <Camera className="h-6 w-6 text-white" />
                </Label>
                <Input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              {/* Información del usuario */}
              <div>
                <h1 className="text-3xl font-bold">{user?.username}</h1>
                <p className="text-lg opacity-90">{user?.email}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p>Manage your account settings and preferences.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label>Nombre</Label>
                    <Input
                      value={user?.name || ""}
                      disabled
                    />
                  </div>
                  <div>
                    <Label>Apellido</Label>
                    <Input
                      value={user?.last_name || ""}
                      disabled
                    />
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <Input
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(prev => ({...prev, phone: e.target.value}))}
                      placeholder="Ingrese su teléfono"
                    />
                  </div>
                  <div>
                    <Label>Rol</Label>
                    <Input value={user?.role_name || ""} disabled />
                  </div>
                  <div>
                    <Label>Equipo</Label>
                    <Input value={user?.team_name || ""} disabled />
                  </div>
                </div>
                <Button type="submit">Actualizar Teléfono</Button>
              </form>
            </CardContent>
          </Card>
          <Card className="p-4">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Email Actual</Label>
                <Input
                  value={user?.email || ""}
                  disabled
                  className="mb-4"
                />
                <form onSubmit={handleEmailChange} className="space-y-4">
                  <div>
                    <Label>Nuevo Email</Label>
                    <Input
                      type="email"
                      value={securityForm.newEmail}
                      onChange={(e) => setSecurityForm(prev => ({...prev, newEmail: e.target.value}))}
                      placeholder="Ingrese nuevo email"
                    />
                  </div>
                  <Button type="submit">Actualizar Email</Button>
                </form>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label>Contraseña Actual</Label>
                  <Input
                    type="password"
                    value={securityForm.currentPassword}
                    onChange={(e) => setSecurityForm(prev => ({...prev, currentPassword: e.target.value}))}
                  />
                </div>
                <div>
                  <Label>Nueva Contraseña</Label>
                  <Input
                    type="password"
                    value={securityForm.newPassword}
                    onChange={(e) => setSecurityForm(prev => ({...prev, newPassword: e.target.value}))}
                  />
                </div>
                <div>
                  <Label>Confirmar Nueva Contraseña</Label>
                  <Input
                    type="password"
                    value={securityForm.confirmPassword}
                    onChange={(e) => setSecurityForm(prev => ({...prev, confirmPassword: e.target.value}))}
                  />
                </div>
                <Button type="submit">Cambiar Contraseña</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DefaultLayout>
  );
}