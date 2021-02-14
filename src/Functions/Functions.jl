module Functions

using ..TopOpt: dim, whichdevice, CPU, GPU, jtvp!, TopOpt, PENALTY_BEFORE_INTERPOLATION
using ..TopOptProblems, ..FEA, ..CheqFilters
using ..Utilities, ForwardDiff, LinearAlgebra, Requires
using Parameters: @unpack
using TimerOutputs, JuAFEM, StaticArrays
using StatsFuns, MappedArrays, LazyArrays
using ..TopOptProblems: getdh
using SparseArrays, Tracker, Statistics, ChainRulesCore, Zygote
using Nonconvex: Nonconvex

export  Objective,
        IneqConstraint,
        BlockIneqConstraint,
        Volume,
        Compliance,
        MeanCompliance,
        BlockCompliance,
        AbstractFunction,
        getfevals,
        getmaxfevals,
        maxedfevals,
        getnvars,
        MicroVonMisesStress,
        MacroVonMisesStress,
        project,
        generate_scenarios,
        hutch_rand!,
        hadamard!,
        GlobalStress

const to = TimerOutput()

abstract type AbstractFunction{T} <: Nonconvex.AbstractFunction end
# Fallback for scalar-valued functions
"""
    jtvp!(out, f, x, v; runf = true)

Finds the product `J'v` and writes it to `out`, where `J` is the Jacobian of `f` at `x`. If `runf` is `true`, the function `f` will be run, otherwise the function will be assumed to have been run by the caller.
"""
function TopOpt.jtvp!(out, f::AbstractFunction, x, v; runf = true)
    runf && f(x)
    @assert length(v) == 1
    @assert all(isfinite, f.grad)
    @assert all(isfinite, v)
    out .= f.grad .* v
    return out
end

abstract type AbstractConstraint{T} <: AbstractFunction{T} end

@params struct Objective{T} <: AbstractFunction{T}
    f
end
Base.show(::IO, ::MIME{Symbol("text/plain")}, ::Objective) = println("TopOpt objective function")
Objective(::Type{T}, f) where {T <: Real} = Objective{T, typeof(f)}(f)
Objective(f::AbstractFunction{T}) where {T <: Real} = Objective(T, f)
Objective(f::Function) = Objective(Float64, f)
@forward_property Objective f

Nonconvex.getdim(o::Objective) = Nonconvex.getdim(o.f)
TopOpt.getnvars(o::Objective) = length(o.grad)

@params struct IneqConstraint{T} <: AbstractConstraint{T}
    f
    s
end
Base.show(::IO, ::MIME{Symbol("text/plain")}, ::IneqConstraint) = println("TopOpt inequality constraint function")
IneqConstraint(::Type{T}, f, s) where {T} = IneqConstraint{T, typeof(f), typeof(s)}(f, s)
IneqConstraint(f::AbstractFunction{T}, s) where {T} = IneqConstraint(T, f, s)
IneqConstraint(f::Function, s) = IneqConstraint(Float64, f, s)
@forward_property IneqConstraint f
Nonconvex.getdim(c::IneqConstraint) = 1

@params struct BlockIneqConstraint{T} <: AbstractConstraint{T}
    f
    s::Union{T, AbstractVector{T}}
    dim::Int
end
Base.show(::IO, ::MIME{Symbol("text/plain")}, ::BlockIneqConstraint) = println("TopOpt block inequality constraint")
function BlockIneqConstraint(::Type{T}, f, s, dim = Nonconvex.getdim(f)) where {T}
    return BlockIneqConstraint(f, convert.(T, s), dim)
end
function BlockIneqConstraint(f::AbstractFunction{T}, s::Union{Any, AbstractVector}) where {T}
    return BlockIneqConstraint(f, convert.(T, s), Nonconvex.getdim(f))
end
function BlockIneqConstraint(f::Function, s::Union{Any, AbstractVector})
    return BlockIneqConstraint(f, s, Nonconvex.getdim(f))
end
@forward_property BlockIneqConstraint f
Nonconvex.getdim(c::BlockIneqConstraint) = c.dim
TopOpt.getnvars(c::BlockIneqConstraint) = TopOpt.getnvars(c.f)
(bc::BlockIneqConstraint)(x) = bc.f(x) .- bc.s

TopOpt.jtvp!(out, f::BlockIneqConstraint, x, v; runf=true) = jtvp!(out, f.f, x, v, runf=runf)

Base.broadcastable(o::Union{Objective, AbstractConstraint}) = Ref(o)
getfunction(o::Union{Objective, AbstractConstraint}) = o.f
getfunction(f::AbstractFunction) = f
Utilities.getsolver(o::Union{Objective, AbstractConstraint}) = o |> getfunction |> getsolver
Utilities.getpenalty(o::Union{Objective, AbstractConstraint}) = o |> getfunction |> getsolver |> getpenalty
Utilities.setpenalty!(o::Union{Objective, AbstractConstraint}, p) = setpenalty!(getsolver(getfunction(o)), p)
Utilities.getprevpenalty(o::Union{Objective, AbstractConstraint}) = o |> getfunction |> getsolver |> getprevpenalty

(o::Objective)(args...) = o.f(args...)

(c::IneqConstraint)(args...) = c.f(args...) - c.s

getfevals(o::Union{AbstractConstraint, Objective}) = o |> getfunction |> getfevals
getfevals(f::AbstractFunction) = f.fevals
getmaxfevals(o::Union{AbstractConstraint, Objective}) = o |> getfunction |> getmaxfevals
getmaxfevals(f::AbstractFunction) = f.maxfevals
maxedfevals(o::Union{Objective, AbstractConstraint}) = maxedfevals(o.f)
maxedfevals(f::AbstractFunction) = getfevals(f) >= getmaxfevals(f)

# For feasibility problems
mutable struct Zero{T, Tsolver} <: AbstractFunction{T}
    solver::Tsolver
    fevals::Int
end
function Zero(solver::AbstractFEASolver)
    return Zero{eltype(solver.vars), typeof(solver)}(solver, 0)
end
function (z::Zero)(x, g=nothing)
    z.fevals += 1
    if g !== nothing
        g .= 0
    end
    return zero(eltype(g))
end

getmaxfevals(::Zero) = Inf
maxedfevals(::Zero) = false
@inline function Base.getproperty(z::Zero{T}, f::Symbol) where {T}
    f === :reuse && return false
    f === :grad && return zero(T)
    return getfield(z, f)
end

include("compliance.jl")
include("volume.jl")
include("stress.jl")
include("trace.jl")
include("mean_compliance.jl")
include("block_compliance.jl")
include("mean_var_std.jl")

end
