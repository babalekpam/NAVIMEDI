export default function MobileTest() {
  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-4">Carnet Mobile App</h1>
        <p className="text-gray-600 text-center mb-6">
          Your personal healthcare companion
        </p>
        <div className="space-y-4">
          <div className="bg-blue-100 p-4 rounded-lg">
            <h3 className="font-semibold">✓ Health Records</h3>
            <p className="text-sm text-gray-600">Access your medical history</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="font-semibold">✓ Appointments</h3>
            <p className="text-sm text-gray-600">Schedule and manage visits</p>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg">
            <h3 className="font-semibold">✓ Medications</h3>
            <p className="text-sm text-gray-600">Track prescriptions</p>
          </div>
          <div className="bg-red-100 p-4 rounded-lg">
            <h3 className="font-semibold">✓ Secure Messaging</h3>
            <p className="text-sm text-gray-600">Chat with your doctors</p>
          </div>
        </div>
        <button 
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold"
          onClick={() => window.location.href = "/patient-login"}
        >
          Access Your Health Records
        </button>
      </div>
    </div>
  );
}