import { useEffect, useState } from "react";
import API from "../api/api";

function Activity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await API.get("/activity");

      setActivities(response.data.activities);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to load activities"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">

      <h1 className="text-3xl font-bold mb-2">
        Activity
      </h1>

      <p className="text-gray-600 mb-8">
        Your recent activities and behavioral history.
      </p>

      {loading && (
        <p>Loading activities...</p>
      )}

      {error && (
        <p className="text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && activities.length === 0 && (
        <div className="border rounded-lg p-6 text-center">
          <p className="text-gray-500">
            No activities recorded yet.
          </p>
        </div>
      )}

      <div className="space-y-4">

        {activities.map((activity) => (
          <div
            key={activity._id}
            className="border rounded-lg p-5 bg-white shadow-sm"
          >

            <div className="flex items-center justify-between">

              <h2 className="font-semibold">
                {activity.type.replaceAll("_", " ")}
              </h2>

              <span className="text-sm text-gray-500">
                {new Date(
                  activity.createdAt
                ).toLocaleString()}
              </span>

            </div>

            <p className="mt-2 text-gray-700">
              {activity.description}
            </p>

          </div>
        ))}

      </div>

    </div>
  );
}

export default Activity;