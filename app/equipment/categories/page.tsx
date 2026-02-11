"use client"

import { useEffect, useState } from "react"
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit2, 
  Layers, 
  Tag, 
  MoreVertical,
  ChevronRight,
  ChevronDown,
  LayoutGrid
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { api } from "@/lib/api"
import { Category } from "@/types"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  
  // Create/Edit Dialog States
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingSubcategory, setEditingSubcategory] = useState<any | null>(null)
  const [parentCategoryId, setParentCategoryId] = useState<string | null>(null)
  
  // Form States
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await api.getCategories(true)
      setCategories(response.data?.categories || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedCategories(newExpanded)
  }

  const handleOpenCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setName(category.name)
      setDescription(category.description || "")
    } else {
      setEditingCategory(null)
      setName("")
      setDescription("")
    }
    setIsCategoryDialogOpen(true)
  }

  const handleOpenSubcategoryDialog = (parentId: string, sub?: any) => {
    setParentCategoryId(parentId)
    if (sub) {
      setEditingSubcategory(sub)
      setName(sub.name)
      setDescription(sub.description || "")
    } else {
      setEditingSubcategory(null)
      setName("")
      setDescription("")
    }
    setIsSubcategoryDialogOpen(true)
  }

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, { name, description })
      } else {
        await api.createCategory({ name, description })
      }
      setIsCategoryDialogOpen(false)
      fetchCategories()
    } catch (error) {
      console.error("Error saving category:", error)
      alert("Erreur lors de l'enregistrement")
    }
  }

  const handleSaveSubcategory = async () => {
    if (!parentCategoryId) return
    try {
      if (editingSubcategory) {
        await api.updateSubcategory(editingSubcategory.id, { name, description })
      } else {
        await api.createSubcategory({ name, description, category_id: parentCategoryId })
      }
      setIsSubcategoryDialogOpen(false)
      fetchCategories()
    } catch (error) {
      console.error("Error saving subcategory:", error)
      alert("Erreur lors de l'enregistrement")
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette catégorie et toutes ses sous-catégories ?")) return
    try {
      await api.deleteCategory(id)
      fetchCategories()
    } catch (error) {
      console.error("Error deleting category:", error)
      alert("Erreur lors de la suppression")
    }
  }

  const handleDeleteSubcategory = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette sous-catégorie ?")) return
    try {
      await api.deleteSubcategory(id)
      fetchCategories()
    } catch (error) {
      console.error("Error deleting subcategory:", error)
      alert("Erreur lors de la suppression")
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header Area */}
      <div className="flex items-center justify-between py-6">
        <Link 
            href="/equipment" 
            className="inline-flex items-center text-slate-500 hover:text-slate-800 transition-colors group font-bold text-sm"
        >
            <div className="bg-slate-100 p-2 rounded-full mr-3 group-hover:bg-slate-200 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            </div>
            Retour à l'inventaire
        </Link>
        
        <Button 
            onClick={() => handleOpenCategoryDialog()}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold active:scale-95 transition-all shadow-lg shadow-blue-100"
        >
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle Catégorie
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <Layers className="h-6 w-6" />
            </div>
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestion des Catégories</h1>
                <p className="text-slate-500 font-medium">Organisez votre parc matériel par familles et sous-familles.</p>
            </div>
        </div>

        {loading ? (
            <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse"></div>)}
            </div>
        ) : categories.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 rounded-[2.5rem] p-20 text-center">
                <LayoutGrid className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">Aucune catégorie configurée.</p>
            </Card>
        ) : (
            <div className="grid gap-4">
                {categories.map((cat) => (
                    <div key={cat.id} className="group">
                        <div className={cn(
                            "bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:border-blue-100",
                            expandedCategories.has(cat.id) && "rounded-b-none border-b-transparent shadow-none"
                        )}>
                            <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleExpand(cat.id)}>
                                <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                    {expandedCategories.has(cat.id) ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors uppercase tracking-tight">{cat.name}</h3>
                                    <p className="text-xs text-slate-400 font-medium">{cat.subcategories?.length || 0} sous-catégories</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleOpenSubcategoryDialog(cat.id)}
                                    className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 rounded-xl"
                                >
                                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                                    Ajouter Sous-famille
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleOpenCategoryDialog(cat)} className="h-10 w-10 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl">
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(cat.id)} className="h-10 w-10 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {expandedCategories.has(cat.id) && (
                            <div className="bg-white border-x border-b border-slate-100 rounded-b-[2rem] p-4 pt-0 shadow-sm overflow-hidden">
                                <div className="space-y-1 mt-2">
                                    {cat.subcategories && cat.subcategories.length > 0 ? (
                                        cat.subcategories.map((sub) => (
                                            <div key={sub.id} className="flex items-center justify-between p-4 pl-14 hover:bg-slate-50 rounded-2xl transition-all group/sub">
                                                <div className="flex items-center gap-3">
                                                    <Tag className="h-3.5 w-3.5 text-slate-300" />
                                                    <span className="font-bold text-slate-600 text-sm italic">{sub.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenSubcategoryDialog(cat.id, sub)} className="h-8 w-8 text-slate-400 hover:text-blue-600 rounded-lg">
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteSubcategory(sub.id)} className="h-8 w-8 text-slate-400 hover:text-red-600 rounded-lg">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center ml-10 border-2 border-dashed border-slate-100 rounded-2xl mt-2">
                                            <p className="text-slate-300 text-xs font-bold uppercase tracking-widest italic">Aucune sous-famille pour cette catégorie</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogContent className="sm:max-w-md">
              <DialogHeader>
                  <DialogTitle>{editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}</DialogTitle>
                  <DialogDescription>
                      Définissez une grande famille de matériel.
                  </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                  <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-tight">Nom de la catégorie</label>
                      <Input 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="ex: Éclairage, Sonorisation..."
                        className="rounded-xl border-slate-200"
                      />
                  </div>
                  <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-tight">Description</label>
                      <Input 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optionnel..."
                        className="rounded-xl border-slate-200"
                      />
                  </div>
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)} className="rounded-xl border-slate-200">Annuler</Button>
                  <Button onClick={handleSaveCategory} className="bg-blue-600 hover:bg-blue-700 rounded-xl font-bold">Enregistrer</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* Subcategory Dialog */}
      <Dialog open={isSubcategoryDialogOpen} onOpenChange={setIsSubcategoryDialogOpen}>
          <DialogContent className="sm:max-w-md">
              <DialogHeader>
                  <DialogTitle>{editingSubcategory ? "Modifier la sous-catégorie" : "Nouvelle sous-catégorie"}</DialogTitle>
                  <DialogDescription>
                      Affinez la classification pour cette famille.
                  </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                  <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-tight">Nom de la sous-famille</label>
                      <Input 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="ex: Moving Heads, Projecteurs LED..."
                        className="rounded-xl border-slate-200"
                      />
                  </div>
                  <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-tight">Description</label>
                      <Input 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optionnel..."
                        className="rounded-xl border-slate-200"
                      />
                  </div>
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsSubcategoryDialogOpen(false)} className="rounded-xl border-slate-200">Annuler</Button>
                  <Button onClick={handleSaveSubcategory} className="bg-blue-600 hover:bg-blue-700 rounded-xl font-bold">Enregistrer</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  )
}
