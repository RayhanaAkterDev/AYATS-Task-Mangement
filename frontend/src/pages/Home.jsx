
import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:4000/api";

const emptyForm = { name: "", isComplete: "no" };

const Home = () => {
    const [tasks, setTasks] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchTasks = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/all-task`);
            setTasks(data.tasks || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load tasks");
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.name.trim()) {
            toast.error("Task name is required.");
            return;
        }

        setLoading(true);

        try {
            if (editingId) {
                const { data } = await axios.put(`${API_URL}/update-task/${editingId}`, {
                    name: form.name.trim(),
                    isComplete: form.isComplete,
                });

                setTasks((currentTasks) =>
                    currentTasks.map((task) => (task._id === editingId ? data.task : task))
                );
                toast.success("Task updated successfully.");
            } else {
                const { data } = await axios.post(`${API_URL}/add-task`, {
                    name: form.name.trim(),
                });

                setTasks((currentTasks) => [data.newTask, ...currentTasks]);
                toast.success("Task added successfully.");
            }

            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (taskId) => {
        try {
            const { data } = await axios.get(`${API_URL}/single-task/${taskId}`);
            setForm({
                name: data.task.name,
                isComplete: data.task.isComplete,
            });
            setEditingId(taskId);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to load task details.");
        }
    };

    const handleDelete = async (taskId) => {
        try {
            await axios.delete(`${API_URL}/delete-task/${taskId}`);
            setTasks((currentTasks) => currentTasks.filter((task) => task._id !== taskId));

            if (editingId === taskId) {
                resetForm();
            }

            toast.success("Task deleted successfully.");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete task.");
        }
    };

    const handleToggleStatus = async (task) => {
        const nextStatus = task.isComplete === "yes" ? "no" : "yes";

        try {
            const { data } = await axios.put(`${API_URL}/update-task/${task._id}`, {
                name: task.name,
                isComplete: nextStatus,
            });

            setTasks((currentTasks) =>
                currentTasks.map((item) => (item._id === task._id ? data.task : item))
            );
            toast.success(`Task marked as ${nextStatus === "yes" ? "completed" : "not completed"}.`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to update task.");
        }
    };

    return (
        <div className="min-h-screen bg-purple-50 px-4 py-10 text-gray-800">
            <div className="mx-auto max-w-5xl">

                <div className="mb-8 rounded-2xl bg-purple-700 p-8 text-white shadow-lg">
                    <p className="text-sm uppercase tracking-widest text-purple-200">
                        Task Management
                    </p>

                    <h1 className="mt-3 text-3xl font-bold">
                        Your Daily Tasks
                    </h1>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1.1fr_2fr]">

                    <form
                        onSubmit={handleSubmit}
                        className="rounded-2xl bg-white p-6 shadow-md"
                    >
                        <h2 className="mb-5 text-xl font-bold text-purple-700">
                            {editingId ? "Edit Task" : "Add New Task"}
                        </h2>

                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Task Name
                        </label>

                        <input
                            type="text"
                            value={form.name}
                            onChange={(event) =>
                                setForm({ ...form, name: event.target.value })
                            }
                            placeholder="Enter task name"
                            className="w-full rounded-lg border border-purple-200 px-3 py-2.5 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                        />

                        <label className="mb-2 mt-5 block text-sm font-semibold text-gray-700">
                            Status
                        </label>

                        <select
                            value={form.isComplete}
                            onChange={(event) =>
                                setForm({ ...form, isComplete: event.target.value })
                            }
                            className="w-full rounded-lg border border-purple-200 px-3 py-2.5 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                        >
                            <option value="no">Not Completed</option>
                            <option value="yes">Completed</option>
                        </select>

                        <div className="mt-6 flex gap-3">

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 rounded-lg bg-purple-600 px-4 py-2.5 font-semibold text-white hover:bg-purple-700 disabled:bg-purple-300"
                            >
                                {loading
                                    ? editingId
                                        ? "Updating..."
                                        : "Saving..."
                                    : editingId
                                    ? "Update Task"
                                    : "Add Task"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="rounded-lg border border-gray-300 px-4 py-2.5 font-semibold text-gray-600 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="rounded-2xl bg-white p-6 shadow-md">

                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-purple-700">
                                Task List
                            </h2>

                            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                                {tasks.length} Items
                            </span>
                        </div>

                        <div className="space-y-3">

                            {tasks.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-purple-200 bg-purple-50 p-6 text-center text-gray-500">
                                    No tasks yet. Add your first task.
                                </div>
                            ) : (
                                tasks.map((task) => (
                                    <div
                                        key={task._id}
                                        className="flex items-center justify-between gap-3 rounded-xl border border-purple-100 bg-purple-50 p-4"
                                    >

                                        <div className="flex items-center gap-3">

                                            <button
                                                type="button"
                                                onClick={() => handleToggleStatus(task)}
                                                className={`h-5 w-5 rounded-full border-2 ${
                                                    task.isComplete === "yes"
                                                        ? "border-green-500 bg-green-500"
                                                        : "border-gray-300 bg-white"
                                                }`}
                                                aria-label={`Toggle task status for ${task.name}`}
                                            />

                                            <div>
                                                <p
                                                    className={`font-semibold ${
                                                        task.isComplete === "yes"
                                                            ? "text-gray-400 line-through"
                                                            : "text-gray-800"
                                                    }`}
                                                >
                                                    {task.name}
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    {task.isComplete === "yes"
                                                        ? "Completed"
                                                        : "Not Completed"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">

                                            <button
                                                type="button"
                                                onClick={() => handleEdit(task._id)}
                                                className="rounded-lg bg-purple-100 px-3 py-1.5 text-sm font-semibold text-purple-700 hover:bg-purple-200"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDelete(task._id)}
                                                className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-200"
                                            >
                                                Delete
                                            </button>

                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ToastContainer
                position="top-right"
                autoClose={2500}
                hideProgressBar
            />
        </div>
    );
};

export default Home;

