import { useState, useCallback } from 'react'
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import BottomNav from './components/BottomNav.jsx'
import MenuDrawer from './components/MenuDrawer.jsx'
import HomeScreen from './screens/HomeScreen.jsx'
import WorkoutsScreen from './screens/WorkoutsScreen.jsx'
import HistoryScreen from './screens/HistoryScreen.jsx'
import SettingsScreen from './screens/SettingsScreen.jsx'
import CreateWorkoutScreen from './screens/CreateWorkoutScreen.jsx'
import ActiveWorkoutScreen from './screens/ActiveWorkoutScreen.jsx'
import WorkoutCompleteScreen from './screens/WorkoutCompleteScreen.jsx'
import HistoryDetailScreen from './screens/HistoryDetailScreen.jsx'
import MarketplaceScreen from './screens/MarketplaceScreen.jsx'
import ProgrammeStoreScreen from './screens/ProgrammeStoreScreen.jsx'
import SavedProgrammesScreen from './screens/SavedProgrammesScreen.jsx'
import PurchasedProgrammesScreen from './screens/PurchasedProgrammesScreen.jsx'
import StartWorkoutScreen from './screens/StartWorkoutScreen.jsx'
import ProgrammeTemplatesScreen from './screens/ProgrammeTemplatesScreen.jsx'
import BusinessToolsScreen from './screens/BusinessToolsScreen.jsx'
import TrainerResourcesScreen from './screens/TrainerResourcesScreen.jsx'
import ClientSupportScreen from './screens/ClientSupportScreen.jsx'
import ClientsScreen from './screens/ClientsScreen.jsx'
import ClientDetailScreen from './screens/ClientDetailScreen.jsx'
import AddCheckInScreen from './screens/AddCheckInScreen.jsx'
import ClientProgressScreen from './screens/ClientProgressScreen.jsx'
import SplashScreen from './screens/SplashScreen.jsx'
import FirstSetupScreen from './screens/FirstSetupScreen.jsx'
import XpOverviewScreen from './screens/XpOverviewScreen.jsx'
import ExerciseCatalogueScreen from './screens/ExerciseCatalogueScreen.jsx'
import PTScheduleScreen from './screens/PTScheduleScreen.jsx'
import WorkPlannerScreen from './screens/WorkPlannerScreen.jsx'
import PTMarketplaceScreen from './screens/PTMarketplaceScreen.jsx'
import AvatarSettingsScreen from './screens/AvatarSettingsScreen.jsx'
import AvatarMarketplaceScreen from './screens/AvatarMarketplaceScreen.jsx'
import StatsScreen from './screens/StatsScreen.jsx'
import {
  getWorkoutTemplates,
  getWorkoutSessions,
  clearAllWorkoutData,
  getAppMode,
  saveAppMode,
  getWeightUnit,
  saveWeightUnit,
  getAvailableEquipment,
  saveAvailableEquipment,
  getMeasurementUnit,
  saveMeasurementUnit,
  getHeightUnit,
  saveHeightUnit,
  getDistanceUnit,
  saveDistanceUnit,
  getFirstName,
} from './data/storage.js'

// Routes that show the bottom nav and side drawer
const MAIN_ROUTES = ['/', '/workouts', '/history', '/settings', '/marketplace', '/clients']

// ─── AppShell ─────────────────────────────────────────────────────────────────
// Manages the three top-level phases: splash → (setup | main).
// Must live inside HashRouter so child AppRoutes can use useLocation.

function AppShell() {
  const [phase, setPhase] = useState('splash')

  const handleSplashComplete = useCallback(() => {
    // Show setup only for a true first launch — no settings key in storage at all.
    // Existing users (who have any saved settings) skip straight to main.
    const raw = localStorage.getItem('fittrackr_settings')
    setPhase(raw !== null ? 'main' : 'setup')
  }, [])

  if (phase === 'splash') return <SplashScreen onComplete={handleSplashComplete} />
  if (phase === 'setup') return <FirstSetupScreen onComplete={() => setPhase('main')} />
  return <AppRoutes />
}

// ─── AppRoutes ────────────────────────────────────────────────────────────────
// AppRoutes is a separate component so it can use useLocation (must be inside HashRouter)
function AppRoutes() {
  const location = useLocation()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Incrementing this causes a re-read from storage after any mutation
  const [, setStorageVersion] = useState(0)
  const refresh = useCallback(() => setStorageVersion(v => v + 1), [])

  const [appMode, setAppMode] = useState(() => getAppMode())
  const handleAppModeChange = useCallback((mode) => {
    if (mode === appMode) return
    saveAppMode(mode)
    setAppMode(mode)
    if (location.pathname !== '/') {
      navigate('/')
    }
  }, [appMode, location.pathname, navigate])

  const [weightUnit, setWeightUnit] = useState(() => getWeightUnit())
  const handleWeightUnitChange = useCallback((unit) => {
    saveWeightUnit(unit)
    setWeightUnit(unit)
  }, [])

  const [availableEquipment, setAvailableEquipment] = useState(() => getAvailableEquipment())
  const handleAvailableEquipmentChange = useCallback((equipment) => {
    saveAvailableEquipment(equipment)
    setAvailableEquipment(equipment)
  }, [])

  const [measurementUnit, setMeasurementUnit] = useState(() => getMeasurementUnit())
  const handleMeasurementUnitChange = useCallback((unit) => {
    saveMeasurementUnit(unit)
    setMeasurementUnit(unit)
  }, [])

  const [heightUnit, setHeightUnit] = useState(() => getHeightUnit())
  const handleHeightUnitChange = useCallback((unit) => {
    saveHeightUnit(unit)
    setHeightUnit(unit)
  }, [])

  const [distanceUnit, setDistanceUnit] = useState(() => getDistanceUnit())
  const handleDistanceUnitChange = useCallback((unit) => {
    saveDistanceUnit(unit)
    setDistanceUnit(unit)
  }, [])

  const [firstName] = useState(() => getFirstName())

  const isMainRoute = MAIN_ROUTES.includes(location.pathname)

  // Re-derive on each render — localStorage reads are synchronous and fast
  const templates = getWorkoutTemplates()
  const sessions  = getWorkoutSessions()

  const handleResetData = () => {
    if (!window.confirm('Reset all workout data? This cannot be undone.')) return
    clearAllWorkoutData()
    refresh()
  }

  const recentSession = sessions.find(s => s.status === 'completed') ?? null

  return (
    <>
      {isMainRoute && (
        <MenuDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onResetData={handleResetData}
          appMode={appMode}
          onAppModeChange={handleAppModeChange}
        />
      )}

      <Routes>
        <Route
          path="/"
          element={
            <HomeScreen
              onMenuOpen={() => setDrawerOpen(true)}
              recentSession={recentSession}
              appMode={appMode}
              firstName={firstName}
            />
          }
        />
        <Route
          path="/workouts"
          element={
            <WorkoutsScreen
              onMenuOpen={() => setDrawerOpen(true)}
              templates={templates}
              onDataChange={refresh}
              appMode={appMode}
            />
          }
        />
        <Route
          path="/workouts/create"
          element={<CreateWorkoutScreen onDataChange={refresh} appMode={appMode} availableEquipment={availableEquipment} />}
        />
        <Route
          path="/workouts/edit/:templateId"
          element={<CreateWorkoutScreen onDataChange={refresh} appMode={appMode} availableEquipment={availableEquipment} />}
        />
        <Route
          path="/history"
          element={
            <HistoryScreen
              onMenuOpen={() => setDrawerOpen(true)}
              sessions={sessions.filter(s => s.status === 'completed')}
            />
          }
        />
        <Route
          path="/settings"
          element={
            <SettingsScreen
              onMenuOpen={() => setDrawerOpen(true)}
              onResetData={handleResetData}
              appMode={appMode}
              onAppModeChange={handleAppModeChange}
              weightUnit={weightUnit}
              onWeightUnitChange={handleWeightUnitChange}
              availableEquipment={availableEquipment}
              onAvailableEquipmentChange={handleAvailableEquipmentChange}
              measurementUnit={measurementUnit}
              onMeasurementUnitChange={handleMeasurementUnitChange}
              heightUnit={heightUnit}
              onHeightUnitChange={handleHeightUnitChange}
              distanceUnit={distanceUnit}
              onDistanceUnitChange={handleDistanceUnitChange}
            />
          }
        />
        <Route
          path="/active-workout"
          element={<ActiveWorkoutScreen appMode={appMode} weightUnit={weightUnit} availableEquipment={availableEquipment} />}
        />
        <Route
          path="/active-workout/:templateId"
          element={<ActiveWorkoutScreen appMode={appMode} weightUnit={weightUnit} availableEquipment={availableEquipment} />}
        />
        <Route
          path="/workout-complete"
          element={<WorkoutCompleteScreen onDataChange={refresh} appMode={appMode} />}
        />
        <Route
          path="/xp-overview"
          element={<XpOverviewScreen />}
        />
        <Route
          path="/history/:sessionId"
          element={<HistoryDetailScreen />}
        />
        <Route
          path="/marketplace"
          element={<MarketplaceScreen onMenuOpen={() => setDrawerOpen(true)} appMode={appMode} />}
        />
        <Route path="/marketplace/store" element={<ProgrammeStoreScreen />} />
        <Route path="/marketplace/saved" element={<SavedProgrammesScreen />} />
        <Route path="/marketplace/purchased" element={<PurchasedProgrammesScreen />} />
        <Route path="/marketplace/templates" element={<ProgrammeTemplatesScreen />} />
        <Route path="/marketplace/business-tools" element={<BusinessToolsScreen />} />
        <Route path="/marketplace/trainer-resources" element={<TrainerResourcesScreen />} />
        <Route path="/marketplace/client-support" element={<ClientSupportScreen />} />
        <Route path="/start-workout" element={<StartWorkoutScreen />} />
        <Route
          path="/clients"
          element={<ClientsScreen onMenuOpen={() => setDrawerOpen(true)} onDataChange={refresh} />}
        />
        <Route
          path="/clients/:clientId"
          element={<ClientDetailScreen appMode={appMode} weightUnit={weightUnit} measurementUnit={measurementUnit} onDataChange={refresh} />}
        />
        <Route
          path="/clients/:clientId/add-checkin"
          element={<AddCheckInScreen weightUnit={weightUnit} measurementUnit={measurementUnit} onDataChange={refresh} />}
        />
        <Route
          path="/clients/:clientId/progress"
          element={<ClientProgressScreen weightUnit={weightUnit} measurementUnit={measurementUnit} onDataChange={refresh} />}
        />
        <Route
          path="/exercise-catalogue"
          element={<ExerciseCatalogueScreen availableEquipment={availableEquipment} />}
        />
        <Route
          path="/pt-schedule"
          element={<PTScheduleScreen />}
        />
        <Route
          path="/work-planner"
          element={<WorkPlannerScreen />}
        />
        <Route
          path="/pt-marketplace"
          element={<PTMarketplaceScreen />}
        />
        <Route
          path="/avatar-settings"
          element={<AvatarSettingsScreen />}
        />
        <Route
          path="/avatar-marketplace"
          element={<AvatarMarketplaceScreen />}
        />
        <Route
          path="/stats"
          element={<StatsScreen />}
        />
      </Routes>

      {isMainRoute && <BottomNav appMode={appMode} />}
    </>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AppShell />
    </HashRouter>
  )
}
