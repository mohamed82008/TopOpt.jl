using Documenter, TopOpt

# Load packages to avoid precompilation output in the docs
# import ...

# Generate examples
include("generate.jl")

GENERATED_EXAMPLES = [joinpath("examples", f) for f in (
    "point_load_cantilever.md",
    )]

makedocs(
    sitename = "TopOpt.jl",
    format = Documenter.HTML(
        prettyurls = get(ENV, "CI", nothing) == "true"
    ),
    # doctest = false,
    pages = [
        "Home" => "index.md",
        "Examples" => GENERATED_EXAMPLES,
        "API Reference" => [
            "reference/TopOptProblems.md",
        ]
    ],
)

# # make sure there are no *.vtu files left around from the build
# cd(joinpath(@__DIR__, "build", "examples")) do
#     foreach(file -> endswith(file, ".vtu") && rm(file), readdir())
# end

if get(ENV, "CI", nothing) == "true"
    deploydocs(
        repo = "github.com/mohamed82008/TopOpt.jl.git",
        push_preview=true,
    )
end
