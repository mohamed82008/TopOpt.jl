@params struct SensFilter{_filtering, T, TV <: AbstractVector{T}} <: AbstractSensFilter
    filtering::Val{_filtering}
    elementinfo::ElementFEAInfo
    metadata::FilterMetadata
    rmin::T
    nodal_grad::TV
    last_grad::TV
    cell_weights::TV
end
Base.show(::IO, ::MIME{Symbol("text/plain")}, ::SensFilter) = println("TopOpt sensitivity filter")

SensFilter{true}(args...) = SensFilter(Val(true), args...)
SensFilter{false}(args...) = SensFilter(Val(false), args...)

function SensFilter(solver::AbstractFEASolver; rmin)
    return SensFilter(Val(true), solver, rmin)
end
function SensFilter(::Val{filtering}, solver::AbstractFEASolver, args...) where {filtering}
    return SensFilter(Val(filtering), whichdevice(solver), solver, args...)
end
function SensFilter(::Val{true}, ::CPU, solver::TS, rmin::T, ::Type{TI}=Int) where {T, TI<:Integer, TS<:AbstractFEASolver}
    metadata = FilterMetadata(solver, rmin, TI)
    TM = typeof(metadata)
    problem = solver.problem
    elementinfo = solver.elementinfo
    grid = problem.ch.dh.grid
    nnodes = getnnodes(grid)
    nodal_grad = zeros(T, nnodes)
    TV = typeof(nodal_grad)

    black = problem.black
    white = problem.white
    nel = length(black)
    nfc = sum(black) + sum(white)
    last_grad = zeros(T, nel-nfc)

    cell_weights = zeros(T, nnodes)
    
    return SensFilter(Val(true), elementinfo, metadata, rmin, nodal_grad, last_grad, cell_weights)
end

function SensFilter(::Val{false}, ::CPU, solver::TS, rmin::T, ::Type{TI}=Int) where {T, TS<:AbstractFEASolver, TI<:Integer}
    elementinfo = solver.elementinfo
    metadata = FilterMetadata(T, TI)
    nodal_grad = T[]
    last_grad = T[]
    cell_weights = T[]
    return SensFilter(Val(false), elementinfo, metadata, rmin, nodal_grad, last_grad, cell_weights)
end

(cf::SensFilter)(x) = x
function ChainRulesCore.rrule(cf::SensFilter{true}, x)
    x, Δ -> begin
        cf.rmin <= 0 && return (nothing, Δ)
        newΔ = copy(Δ)
        @unpack elementinfo, nodal_grad, cell_weights, metadata = cf
        @unpack black, white, varind, cellvolumes, cells = elementinfo
        @unpack cell_neighbouring_nodes, cell_node_weights = metadata
        node_cells = elementinfo.metadata.node_cells
        update_nodal_grad!(nodal_grad, node_cells, cell_weights, cells, cellvolumes, black, white, varind, Δ)
        normalize_grad!(nodal_grad, cell_weights)
        update_grad!(newΔ, black, white, varind, cell_neighbouring_nodes, cell_node_weights, nodal_grad)
        return (nothing, newΔ)
    end
end

function update_nodal_grad!(nodal_grad::AbstractVector, node_cells, cell_weights, cells, cellvolumes, black, white, varind, grad)
    T = eltype(nodal_grad)
    for n in 1:length(nodal_grad)
        nodal_grad[n] = zero(T)
        cell_weights[n] = zero(T)
        r = node_cells.offsets[n]:node_cells.offsets[n+1]-1
        for i in r
            c = node_cells.values[i][1]
            if black[c] || white[c]
                continue
            end
            ind = varind[c]
            w = cellvolumes[c]
            cell_weights[n] += w
            nodal_grad[n] += w * grad[ind]
        end
    end
    return nodal_grad
end

function normalize_grad!(nodal_grad::AbstractVector, cell_weights)
    for n in 1:length(nodal_grad)
        if cell_weights[n] > 0
            nodal_grad[n] /= cell_weights[n]
        end
    end
end

function update_grad!(grad::AbstractVector, black, white, varind, cell_neighbouring_nodes, cell_node_weights, nodal_grad)
    @inbounds for i in 1:length(black)
        if black[i] || white[i]
            continue
        end
        ind = varind[i]
        nodes = cell_neighbouring_nodes[ind]
        if length(nodes) == 0
            continue
        end
        weights = cell_node_weights[ind]
        grad[ind] = dot(view(nodal_grad, nodes), weights) / sum(weights)
    end

    return
end
