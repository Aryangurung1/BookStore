# Base runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5000

# Build image
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["BookHeaven.csproj", "./"]
RUN dotnet restore "./BookHeaven.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "BookHeaven.csproj" -c Release -o /app/build

# Publish image
FROM build AS publish
RUN dotnet publish "BookHeaven.csproj" -c Release -o /app/publish

# Final runtime image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "BookHeaven.dll"]
