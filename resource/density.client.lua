local Density = {}

Density.value = 0.5
Density.active = false

function Density:set(value)
    self.value = value
end
exports('setDensity', function(value)
    Density:set(value)
end)

function Density:pause()
    self.active = false
end

function Density:begin()
    if (self.active) then return false end
    self.active = true

    Citizen.CreateThread(function()
        while self.active do
            SetVehicleDensityMultiplierThisFrame(self.value)
            SetRandomVehicleDensityMultiplierThisFrame(self.value)
            SetParkedVehicleDensityMultiplierThisFrame(self.value)
            SetScenarioPedDensityMultiplierThisFrame(self.value, self.value)
            SetPedDensityMultiplierThisFrame(self.value)
            Wait(1)
        end
    end)
end

Density:begin()