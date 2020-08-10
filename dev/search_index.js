var documenterSearchIndex = {"docs":
[{"location":"TopOptProblems/#TopOptProblems","page":"TopOptProblems","title":"TopOptProblems","text":"","category":"section"},{"location":"TopOptProblems/","page":"TopOptProblems","title":"TopOptProblems","text":"This sub-module of TopOpt defines a number of standard topology optimization problems for the convenient testing of algorithms.","category":"page"},{"location":"TopOptProblems/","page":"TopOptProblems","title":"TopOptProblems","text":"CurrentModule = TopOpt.TopOptProblems","category":"page"},{"location":"TopOptProblems/#Problem-types","page":"TopOptProblems","title":"Problem types","text":"","category":"section"},{"location":"TopOptProblems/#Abstract-type","page":"TopOptProblems","title":"Abstract type","text":"","category":"section"},{"location":"TopOptProblems/","page":"TopOptProblems","title":"TopOptProblems","text":"StiffnessTopOptProblem is an abstract type that a number of linear elasticity, quasi-static, topology optimization problems subtype.","category":"page"},{"location":"TopOptProblems/","page":"TopOptProblems","title":"TopOptProblems","text":"StiffnessTopOptProblem","category":"page"},{"location":"TopOptProblems/#TopOpt.TopOptProblems.StiffnessTopOptProblem","page":"TopOptProblems","title":"TopOpt.TopOptProblems.StiffnessTopOptProblem","text":"Abstract stiffness topology optimization problem. All subtypes must have the following fields:     ch::ConstraintHandler     black::BitVector     white::BitVector     varind::AbstractVector{Int}     metadata::Metadata\n\n\n\n\n\n","category":"type"},{"location":"TopOptProblems/#Concrete-types","page":"TopOptProblems","title":"Concrete types","text":"","category":"section"},{"location":"TopOptProblems/","page":"TopOptProblems","title":"TopOptProblems","text":"The following types are all concrete subtypes of StiffnessTopOptProblem. PointLoadCantilever is a cantilever beam problem with a point load as shown below. HalfMBB is the half Messerschmitt-Bölkow-Blohm (MBB) beam problem commonly used in topology optimization literature. LBeam and TieBeam are the common L-beam and tie-beam test problem used in topology optimization literature. The PointLoadCantilever and HalfMBB problems can be either 2D or 3D depending on the type of the inputs to the constructor. If the number of elements and sizes of elements are 2-tuples, the problem constructed will be 2D. And if they are 3-tuples, the problem constructed will be 3D. For the 3D versions, the point loads are applied at approximately the mid-depth point. The TieBeam and LBeam problems are always 2D.","category":"page"},{"location":"TopOptProblems/","page":"TopOptProblems","title":"TopOptProblems","text":"Finally, InpStiffness is a problem type that is instantiated by importing an .inp file. This can be used to represent an arbitrary unstructured mesh with complex boundary condition domains and load specification. The .inp file can be exported from a number of common finite element software such as: FreeCAD or ABAQUS.","category":"page"},{"location":"TopOptProblems/","page":"TopOptProblems","title":"TopOptProblems","text":"PointLoadCantilever\nHalfMBB\nLBeam\nTieBeam\nInpStiffness","category":"page"},{"location":"TopOptProblems/#TopOpt.TopOptProblems.PointLoadCantilever","page":"TopOptProblems","title":"TopOpt.TopOptProblems.PointLoadCantilever","text":"///**********************************\n///*                                *\n///*                                * |\n///*                                * |\n///********************************** v\n\n\nstruct PointLoadCantilever{dim, T, N, M} <: StiffnessTopOptProblem{dim, T}\n    rect_grid::RectilinearGrid{dim, T, N, M}\n    E::T\n    ν::T\n    ch::ConstraintHandler{DofHandler{dim, N, T, M}, T}\n    force::T\n    force_dof::Int\n    metadata::Metadata\nend\n\nAPI:\n\n    PointLoadCantilever(::Type{Val{CellType}}, nels::NTuple{dim,Int}, sizes::NTuple{dim}, E, ν, force) where {dim, CellType}\n\ndim: dimension of the problem\n\nT: number type for computations and coordinates\n\nN: number of nodes in a cell of the grid\n\nM: number of faces in a cell of the grid\n\nrect_grid: a RectilinearGrid struct\n\nE: Young's modulus\n\nν: Poisson's ration\n\nch: a JuAFEM.ConstraintHandler struct\n\nforce: force at the center right of the cantilever beam (positive is downward)\n\nforce_dof: dof number at which the force is applied\n\nmetadata: Metadata having various cell-node-dof relationships\n\nnels: number of elements in each direction, a 2-tuple for 2D problems and a 3-tuple for 3D problems\n\nsizes: the size of each element in each direction, a 2-tuple for 2D problems and a 3-tuple for 3D problems\n\nCellType: can be either :Linear or :Quadratic to determine the order of the geometric and field basis functions and element type. Only isoparametric elements are supported for now.\n\nExample:\n\nnels = (60,20);\nsizes = (1.0,1.0);\nE = 1.0;\nν = 0.3;\nforce = 1.0;\n\n# Linear elements and linear basis functions\ncelltype = :Linear\n\n# Quadratic elements and quadratic basis functions\n#celltype = :Quadratic\n\nproblem = PointLoadCantilever(Val{celltype}, nels, sizes, E, ν, force)\n\n\n\n\n\n","category":"type"},{"location":"TopOptProblems/#TopOpt.TopOptProblems.HalfMBB","page":"TopOptProblems","title":"TopOpt.TopOptProblems.HalfMBB","text":" |\n |\n v\nO*********************************\nO*                               *\nO*                               *\nO*                               *\nO*********************************\n                                 O\n\nstruct HalfMBB{dim, T, N, M} <: StiffnessTopOptProblem{dim, T}\n    rect_grid::RectilinearGrid{dim, T, N, M}\n    E::T\n    ν::T\n    ch::ConstraintHandler{DofHandler{dim, N, T, M}, T}\n    force::T\n    force_dof::Int\n    metadata::Metadata\nend\n\nAPI:\n\n    HalfMBB(::Type{Val{CellType}}, nels::NTuple{dim,Int}, sizes::NTuple{dim}, E, ν, force) where {dim, CellType}\n\ndim: dimension of the problem\n\nT: number type for computations and coordinates\n\nN: number of nodes in a cell of the grid\n\nM: number of faces in a cell of the grid\n\nrect_grid: a RectilinearGrid struct\n\nE: Young's modulus\n\nν: Poisson's ration\n\nch: a JuAFEM.ConstraintHandler struct\n\nforce: force at the top left of half the MBB (positive is downward)\n\nforce_dof: dof number at which the force is applied\n\nmetadata: Metadata having various cell-node-dof relationships\n\nnels: number of elements in each direction, a 2-tuple for 2D problems and a 3-tuple for 3D problems\n\nsizes: the size of each element in each direction, a 2-tuple for 2D problems and a 3-tuple for 3D problems\n\nCellType: can be either :Linear or :Quadratic to determine the order of the geometric and field basis functions and element type. Only isoparametric elements are supported for now.\n\nExample:\n\nnels = (60,20);\nsizes = (1.0,1.0);\nE = 1.0;\nν = 0.3;\nforce = -1.0;\n\n# Linear elements and linear basis functions\ncelltype = :Linear\n\n# Quadratic elements and quadratic basis functions\n#celltype = :Quadratic\n\nproblem = HalfMBB(Val{celltype}, nels, sizes, E, ν, force)\n\n\n\n\n\n","category":"type"},{"location":"TopOptProblems/#TopOpt.TopOptProblems.LBeam","page":"TopOptProblems","title":"TopOpt.TopOptProblems.LBeam","text":"////////////\n............\n.          .\n.          .\n.          . \n.          .                    \n.          ......................\n.                               .\n.                               . \n.                               . |\n................................. v\n                                force\n\nstruct LBeam{T, N, M} <: StiffnessTopOptProblem{2, T}\n    E::T\n    ν::T\n    ch::ConstraintHandler{<:DofHandler{2, N, T, M}, T}\n    force::T\n    force_dof::Integer\n    black::AbstractVector\n    white::AbstractVector\n    varind::AbstractVector{Int}\n    metadata::Metadata\nend\n\nAPI:\n\n    LBeam(::Type{Val{CellType}}, ::Type{T}=Float64; length = 100, height = 100, upperslab = 50, lowerslab = 50, E = 1.0, ν = 0.3, force = 1.0) where {T, CellType}\n\nT: number type for computations and coordinates\n\nN: number of nodes in a cell of the grid\n\nM: number of faces in a cell of the grid\n\nE: Young's modulus\n\nν: Poisson's ration\n\nch: a JuAFEM.ConstraintHandler struct\n\nforce: force at the center right of the cantilever beam (positive is downward)\n\nforce_dof: dof number at which the force is applied\n\nmetadata:: Metadata having various cell-node-dof relationships\n\nlength, height, upperslab and lowerslab are explained in LGrid.\n\nCellType: can be either :Linear or :Quadratic to determine the order of the geometric and field basis functions and element type. Only isoparametric elements are supported for now.\n\nExample:\n\nE = 1.0;\nν = 0.3;\nforce = 1.0;\n\n# Linear elements and linear basis functions\ncelltype = :Linear\n\n# Quadratic elements and quadratic basis functions\n#celltype = :Quadratic\n\nproblem = LBeam(Val{celltype}, E = E, ν = ν, force = force)\n\n\n\n\n\n","category":"type"},{"location":"TopOptProblems/#TopOpt.TopOptProblems.TieBeam","page":"TopOptProblems","title":"TopOpt.TopOptProblems.TieBeam","text":"                                                               1\n                                                               \n                                                              OOO\n                                                              ...\n                                                              . .\n                                                           4  . . \n                                30                            . .   \n/ . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . <-\n/ .                                                                 . <- 2 f \n/ .    3                                                            . <- \n/ . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . <-\n                                                              ^^^\n                                                              |||\n                                                              1 f\n\n\n\n\n\n","category":"type"},{"location":"TopOptProblems/#TopOpt.TopOptProblems.IO.INP.InpStiffness","page":"TopOptProblems","title":"TopOpt.TopOptProblems.IO.INP.InpStiffness","text":"InpStiffness(filepath::AbstractString; keep_load_cells = false)\n\nImports stiffness problem from a .inp file, e.g. InpStiffness(\"example.inp\"). The keep_load_cells keyword argument will enforce that any cell with a load applied on it is to be part of the final optimal design generated by topology optimization algorithms.\n\n\n\n\n\n","category":"type"},{"location":"TopOptProblems/#Grids","page":"TopOptProblems","title":"Grids","text":"","category":"section"},{"location":"TopOptProblems/","page":"TopOptProblems","title":"TopOptProblems","text":"Grid types are defined in TopOptProblems because a number of topology optimization problems share the same underlying grid but apply the loads and boundary conditions at different locations. For example, the PointLoadCantilever and HalfMBB problems use the same rectilinear grid, RectilinearGrid, under the hood. The LBeam problem uses the LGrid grid type under the hood. New problem types can be defined using the same grid types but different loads or boundary conditions.","category":"page"},{"location":"TopOptProblems/","page":"TopOptProblems","title":"TopOptProblems","text":"RectilinearGrid\nLGrid","category":"page"},{"location":"TopOptProblems/#TopOpt.TopOptProblems.RectilinearGrid","page":"TopOptProblems","title":"TopOpt.TopOptProblems.RectilinearGrid","text":"struct RectilinearGrid{dim, T, N, M} <: AbstractGrid{dim, T}\n    grid::JuAFEM.Grid{dim, N, T, M}\n    nels::NTuple{dim, Int}\n    sizes::NTuple{dim, T}\n    corners::NTuple{2, Vec{dim,T}}\n    white_cells::BitVector\n    black_cells::BitVector\n    constant_cells::BitVector\nend\n\ndim: dimension of the problem\n\nT: number type for computations and coordinates\n\nN: number of nodes in a cell of the grid\n\nM: number of faces in a cell of the grid\n\ngrid: a JuAFEM.Grid struct\n\nnels: number of elements in every dimension\n\nsizes: dimensions of each rectilinear cell\n\ncorners: 2 corner points of the rectilinear grid\n\nwhite_cells: cells fixed to be void during optimization\n\nblack_cells: cells fixed to have material during optimization\n\nconstant_cells: cells fixed to be either void or have material during optimization\n\nAPI:\n\nfunction RectilinearGrid(nels::NTuple{dim,Int}, sizes::NTuple{dim,T}) where {dim,T}\n\nExample:\n\nrectgrid = RectilinearGrid((60,20), (1.0,1.0))\n\n\n\n\n\n","category":"type"},{"location":"TopOptProblems/#TopOpt.TopOptProblems.LGrid","page":"TopOptProblems","title":"TopOpt.TopOptProblems.LGrid","text":"Examples:\n\ngrid = LGrid(upperslab = 30, lowerslab = 70)\ngrid = LGrid(Val{:Linear}, (2, 4), (2, 2), Vec{2,Float64}((0.0,0.0)), Vec{2,Float64}((2.0, 4.0)), Vec{2,Float64}((4.0, 2.0)))\n\n        upperslab\n       ............\n       .          .\n       .          .\n       .          . \nheight .          .                    \n       .          ......................\n       .                               .\n       .                               . lowerslab\n       .                               .\n       .................................\n                    length\n\n\n\n\n\n            UR\n ............\n .          .\n .          .\n .          . \n .          .                    MR\n .          ......................\n .                               .\n .                               .\n .                               .\n .................................\nLL\n\n\n\n\n\n","category":"function"},{"location":"TopOptProblems/#Finite-element-backend","page":"TopOptProblems","title":"Finite element backend","text":"","category":"section"},{"location":"TopOptProblems/","page":"TopOptProblems","title":"TopOptProblems","text":"Currently, TopOpt uses a forked version of JuAFEM.jl. This means that all the problems above are described in the language and types of JuAFEM.","category":"page"},{"location":"TopOptProblems/","page":"TopOptProblems","title":"TopOptProblems","text":"The fork is needed for GPU support but the main package should also work on the CPU. The changes in the fork should make it back to the main repo at some point.","category":"page"},{"location":"TopOptProblems/#Matrices-and-vectors","page":"TopOptProblems","title":"Matrices and vectors","text":"","category":"section"},{"location":"TopOptProblems/#ElementFEAInfo","page":"TopOptProblems","title":"ElementFEAInfo","text":"","category":"section"},{"location":"TopOptProblems/","page":"TopOptProblems","title":"TopOptProblems","text":"ElementFEAInfo","category":"page"},{"location":"TopOptProblems/#TopOpt.TopOptProblems.ElementFEAInfo","page":"TopOptProblems","title":"TopOpt.TopOptProblems.ElementFEAInfo","text":"struct ElementFEAInfo{dim, T}\n    Kes::AbstractVector{<:AbstractMatrix{T}}\n    fes::AbstractVector{<:AbstractVector{T}}\n    fixedload::AbstractVector{T}\n    cellvolumes::AbstractVector{T}\n    cellvalues::CellValues{dim, T}\n    facevalues::FaceValues{<:Any, T}\n    metadata::Metadata\n    black::AbstractVector\n    white::AbstractVector\n    varind::AbstractVector{Int}\n    cells\nend\n\nAn instance of the ElementFEAInfo type stores element information such as:\n\nKes: the element stiffness matrices,\nfes: the element load vectors,\ncellvolumes: the element volumes,\ncellvalues and facevalues: two JuAFEM types that facilitate cell and face iteration and queries.\nmetadata: that stores degree of freedom (dof) to node mapping, dof to cell mapping, etc.\nblack: a BitVector such that black[i] is 1 iff element i must be part of any feasible design.\nwhite: a BitVector such that white[i] is 1 iff element i must never be part of any feasible design.\nvarind: a vector such that varind[i] gives the decision variable index of element i.\ncells: the cell connectivities,\n\n\n\n\n\n","category":"type"},{"location":"TopOptProblems/#GlobalFEAInfo","page":"TopOptProblems","title":"GlobalFEAInfo","text":"","category":"section"},{"location":"TopOptProblems/","page":"TopOptProblems","title":"TopOptProblems","text":"GlobalFEAInfo","category":"page"},{"location":"TopOptProblems/#TopOpt.TopOptProblems.GlobalFEAInfo","page":"TopOptProblems","title":"TopOpt.TopOptProblems.GlobalFEAInfo","text":"struct GlobalFEAInfo{T, TK<:AbstractMatrix{T}, Tf<:AbstractVector{T}, Tchol}\n    K::TK\n    f::Tf\n    cholK::Tchol\nend\n\nAn instance of GlobalFEAInfo hosts the global stiffness matrix K, the load vector f and the cholesky decomposition of the K, cholK.\n\n\n\n\n\n","category":"type"},{"location":"QuickStart/#Quick-start","page":"Quick start","title":"Quick start","text":"","category":"section"},{"location":"QuickStart/#Setup","page":"Quick start","title":"Setup","text":"","category":"section"},{"location":"QuickStart/","page":"Quick start","title":"Quick start","text":"using Pkg\n\npkg\"add https://github.com/mohamed82008/JuAFEM.jl#master\"\npkg\"add https://github.com/mohamed82008/VTKDataTypes.jl#master\"\npkg\"add https://github.com/mohamed82008/KissThreading.jl#master\"\npkg\"add https://github.com/mohamed82008/TopOpt.jl#master\"\npkg\"add Makie\"","category":"page"},{"location":"QuickStart/#Usage-example","page":"Quick start","title":"Usage example","text":"","category":"section"},{"location":"QuickStart/","page":"Quick start","title":"Quick start","text":"# Load the package\n\nusing TopOpt, Makie\n\n# Define the problem\n\nE = 1.0 # Young’s modulus\nv = 0.3 # Poisson’s ratio\nf = 1.0 # downward force\n\nproblem = PointLoadCantilever(Val{:Linear}, (40, 20, 20), (1.0, 1.0, 1.0), E, v, f)\n# problem = HalfMBB(Val{:Linear}, (60, 20), (1.0, 1.0), E, v, f)\n# problem = PointLoadCantilever(Val{:Quadratic}, (160, 40), (1.0, 1.0), E, v, f)\n# problem = LBeam(Val{:Linear}, Float64)\n\n# Parameter settings\n\nV = 0.3 # volume fraction\nxmin = 0.001 # minimum density\nrmin = 4.0 # density filter radius\n\n# Define a finite element solver\n\npenalty = TopOpt.PowerPenalty(3.0)\nsolver = FEASolver(Displacement, Direct, problem, xmin = xmin,\n    penalty = penalty)\n\n# Define compliance objective\n\nobj = Objective(TopOpt.Compliance(problem, solver, filterT = DensityFilter,\n    rmin = rmin, tracing = true, logarithm = false))\n\n# Define volume constraint\n\nconstr = Constraint(TopOpt.Volume(problem, solver, filterT = DensityFilter, rmin = rmin), V)\n\n# Define subproblem optimizer\n\nmma_options = options = MMA.Options(maxiter = 3000, \n    tol = MMA.Tolerances(kkttol = 0.001))\nconvcriteria = MMA.KKTCriteria()\noptimizer = MMAOptimizer(obj, constr, MMA.MMA87(),\n    ConjugateGradient(), options = mma_options,\n    convcriteria = convcriteria)\n\n# Define SIMP optimizer\n\nsimp = SIMP(optimizer, penalty.p)\n\n# Solve\n\nx0 = fill(1.0, length(solver.vars));\nresult = simp(x0)\n\n# Visualize the result using Makie.jl\n\nglmesh = GLMesh(problem, result.topology)\nmesh(glmesh)","category":"page"},{"location":"#TopOpt.jl-Documentation","page":"TopOpt.jl Documentation","title":"TopOpt.jl Documentation","text":"","category":"section"},{"location":"","page":"TopOpt.jl Documentation","title":"TopOpt.jl Documentation","text":"A WIP topology optimization package written in the Julia programming language.","category":"page"},{"location":"","page":"TopOpt.jl Documentation","title":"TopOpt.jl Documentation","text":"Pages = [\"QuickStart.md\", \"TopOptProblems.md\"]","category":"page"}]
}
