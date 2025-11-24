import React, { useState } from 'react';
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog';

interface Driver {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  vehicule: string;
  numeroPermis: string;
  disponible: boolean;
  dateCreation: string;
  nomComplet?: string;
}

interface DriversSectionProps {
  drivers: Driver[];
  loadingStates: any;
  onAddDriver: (driverData: any) => Promise<void>;
  onEditDriver: (id: number, driverData: any) => Promise<void>;
  onDeleteDriver: (id: number) => Promise<void>;
  onToggleDriverAvailability: (id: number) => Promise<void>;
}

export const DriversSection: React.FC<DriversSectionProps> = ({
  drivers,
  loadingStates,
  onAddDriver,
  onEditDriver,
  onDeleteDriver,
  onToggleDriverAvailability
}) => {
  const [isAddDriverDialogOpen, setIsAddDriverDialogOpen] = useState(false);
  const [isEditDriverDialogOpen, setIsEditDriverDialogOpen] = useState(false);
  const [currentDriver, setCurrentDriver] = useState<Driver | null>(null);

  const [driverFormData, setDriverFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    vehicule: '',
    numeroPermis: '',
  });

  const resetDriverForm = () => {
    setDriverFormData({
      nom: '',
      prenom: '',
      telephone: '',
      email: '',
      vehicule: '',
      numeroPermis: '',
    });
  };

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onAddDriver(driverFormData);
      setIsAddDriverDialogOpen(false);
      resetDriverForm();
    } catch (err) {
      console.error(err);
    }
  };

  const openEditDriverDialog = (driver: Driver) => {
    setCurrentDriver(driver);
    setDriverFormData({
      nom: driver.nom,
      prenom: driver.prenom,
      telephone: driver.telephone,
      email: driver.email,
      vehicule: driver.vehicule,
      numeroPermis: driver.numeroPermis,
    });
    setIsEditDriverDialogOpen(true);
  };

  const handleEditDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDriver) return;

    try {
      await onEditDriver(currentDriver.id, driverFormData);
      setIsEditDriverDialogOpen(false);
      resetDriverForm();
      setCurrentDriver(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Drivers Actions */}
      <div className="mb-6">
        <Dialog open={isAddDriverDialogOpen} onOpenChange={setIsAddDriverDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 hover:scale-105 transition-transform duration-200">
              <Plus className="h-4 w-4" />
              Ajouter un chauffeur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau chauffeur</DialogTitle>
              <DialogDescription>
                Remplissez les informations du chauffeur
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddDriver}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-driver-nom">Nom *</Label>
                    <Input
                      id="add-driver-nom"
                      value={driverFormData.nom}
                      onChange={(e) => setDriverFormData({ ...driverFormData, nom: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-driver-prenom">Prénom *</Label>
                    <Input
                      id="add-driver-prenom"
                      value={driverFormData.prenom}
                      onChange={(e) => setDriverFormData({ ...driverFormData, prenom: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-driver-telephone">Téléphone *</Label>
                    <Input
                      id="add-driver-telephone"
                      type="tel"
                      value={driverFormData.telephone}
                      onChange={(e) => setDriverFormData({ ...driverFormData, telephone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-driver-email">Email *</Label>
                    <Input
                      id="add-driver-email"
                      type="email"
                      value={driverFormData.email}
                      onChange={(e) => setDriverFormData({ ...driverFormData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-driver-vehicule">Véhicule *</Label>
                    <Input
                      id="add-driver-vehicule"
                      value={driverFormData.vehicule}
                      onChange={(e) => setDriverFormData({ ...driverFormData, vehicule: e.target.value })}
                      placeholder="ex: Voiture, Moto, Camion"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-driver-numeroPermis">Numéro de permis *</Label>
                    <Input
                      id="add-driver-numeroPermis"
                      value={driverFormData.numeroPermis}
                      onChange={(e) => setDriverFormData({ ...driverFormData, numeroPermis: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDriverDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={loadingStates.addDriver}>
                  {loadingStates.addDriver ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Ajout...
                    </>
                  ) : (
                    "Ajouter"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Drivers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des chauffeurs</CardTitle>
          <CardDescription>
            Gérez vos chauffeurs et leur disponibilité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nom complet</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Véhicule</TableHead>
                  <TableHead>Disponibilité</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-mono">#{driver.id.toString().padStart(4, '0')}</TableCell>
                    <TableCell>
                      <div className="font-medium">{driver.nomComplet || `${driver.prenom} ${driver.nom}`}</div>
                    </TableCell>
                    <TableCell>{driver.telephone}</TableCell>
                    <TableCell>{driver.email}</TableCell>
                    <TableCell>{driver.vehicule}</TableCell>
                    <TableCell>
                      <Badge className={driver.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {driver.disponible ? 'Disponible' : 'Indisponible'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDriverDialog(driver)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant={driver.disponible ? "destructive" : "default"}
                          onClick={() => onToggleDriverAvailability(driver.id)}
                        >
                          {driver.disponible ? 'Désactiver' : 'Activer'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onDeleteDriver(driver.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Driver Dialog */}
      <Dialog open={isEditDriverDialogOpen} onOpenChange={setIsEditDriverDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le chauffeur</DialogTitle>
            <DialogDescription>
              Modifiez les informations du chauffeur
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditDriver}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-driver-nom">Nom *</Label>
                  <Input
                    id="edit-driver-nom"
                    value={driverFormData.nom}
                    onChange={(e) => setDriverFormData({ ...driverFormData, nom: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-driver-prenom">Prénom *</Label>
                  <Input
                    id="edit-driver-prenom"
                    value={driverFormData.prenom}
                    onChange={(e) => setDriverFormData({ ...driverFormData, prenom: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-driver-telephone">Téléphone *</Label>
                  <Input
                    id="edit-driver-telephone"
                    type="tel"
                    value={driverFormData.telephone}
                    onChange={(e) => setDriverFormData({ ...driverFormData, telephone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-driver-email">Email *</Label>
                  <Input
                    id="edit-driver-email"
                    type="email"
                    value={driverFormData.email}
                    onChange={(e) => setDriverFormData({ ...driverFormData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-driver-vehicule">Véhicule *</Label>
                  <Input
                    id="edit-driver-vehicule"
                    value={driverFormData.vehicule}
                    onChange={(e) => setDriverFormData({ ...driverFormData, vehicule: e.target.value })}
                    placeholder="ex: Voiture, Moto, Camion"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-driver-numeroPermis">Numéro de permis *</Label>
                  <Input
                    id="edit-driver-numeroPermis"
                    value={driverFormData.numeroPermis}
                    onChange={(e) => setDriverFormData({ ...driverFormData, numeroPermis: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDriverDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};