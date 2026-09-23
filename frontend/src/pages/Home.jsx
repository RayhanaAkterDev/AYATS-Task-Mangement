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
                    currentTasks.map((task) =>
                        task._id === editingId ? data.task : task
                    )
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
            toast.error(
                error.response?.data?.message || "Unable to load task details."
            );
        }
    };

    const handleDelete = async (taskId) => {
        try {
            await axios.delete(`${API_URL}/delete-task/${taskId}`);

            setTasks((currentTasks) =>
                currentTasks.filter((task) => task._id !== taskId)
            );

            if (editingId === taskId) {
                resetForm();
            }

            toast.success("Task deleted successfully.");
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to delete task."
            );
        }
    };

    const handleToggleStatus = async (task) => {
        const nextStatus = task.isComplete === "yes" ? "no" : "yes";

        try {
            const { data } = await axios.put(
                `${API_URL}/update-task/${task._id}`,
                {
                    name: task.name,
                    isComplete: nextStatus,
                }
            );

            setTasks((currentTasks) =>
                currentTasks.map((item) =>
                    item._id === task._id ? data.task : item
                )
            );

            toast.success(
                `Task marked as ${
                    nextStatus === "yes" ? "completed" : "not completed"
                }.`
            );
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Unable to update task."
            );
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f6fa] py-16 font-inter text-slate-800">
            <div className="mx-auto max-w-6xl px-5">

                {/* Header */}
                <div className="mb-8">

                    <div className="flex items-center gap-3">
                        <span className="h-px w-8 bg-indigo-500"></span>

                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-600">
                            AYATS
                        </p>
                    </div>

                    <h1 className="mt-3 font-dm-serif text-4xl leading-tight text-slate-900 md:text-5xl">
                        Task Management
                    </h1>

                    <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                        Organize your work, keep track of your progress, and
                        complete your daily tasks.
                    </p>

                </div>


                {/* Statistics */}
                <div className="mb-8 grid gap-4 sm:grid-cols-3">

                    {/* Total */}
                    <div className="group relative overflow-hidden border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

                        <div className="absolute right-0 top-0 h-16 w-16 translate-x-6 -translate-y-6 rounded-full bg-indigo-50"></div>

                        <div className="relative">

                            <div className="flex items-center justify-between">

                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Total Tasks
                                </p>

                                <span className="flex h-8 w-8 items-center justify-center bg-indigo-50 text-sm text-indigo-600">
                                    #
                                </span>

                            </div>

                            <p className="mt-4 font-dm-serif text-4xl text-slate-900">
                                {tasks.length}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                All your tasks
                            </p>

                        </div>

                    </div>


                    {/* Unfinished */}
                    <div className="group relative overflow-hidden border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

                        <div className="absolute right-0 top-0 h-16 w-16 translate-x-6 -translate-y-6 rounded-full bg-amber-50"></div>

                        <div className="relative">

                            <div className="flex items-center justify-between">

                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Unfinished
                                </p>

                                <span className="flex h-8 w-8 items-center justify-center bg-amber-50 text-sm text-amber-600">
                                    !
                                </span>

                            </div>

                            <p className="mt-4 font-dm-serif text-4xl text-amber-600">
                                {
                                    tasks.filter(
                                        (task) => task.isComplete === "no"
                                    ).length
                                }
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Still to complete
                            </p>

                        </div>

                    </div>


                    {/* Completed */}
                    <div className="group relative overflow-hidden border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

                        <div className="absolute right-0 top-0 h-16 w-16 translate-x-6 -translate-y-6 rounded-full bg-emerald-50"></div>

                        <div className="relative">

                            <div className="flex items-center justify-between">

                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Completed
                                </p>

                                <span className="flex h-8 w-8 items-center justify-center bg-emerald-50 text-sm font-bold text-emerald-600">
                                    ✓
                                </span>

                            </div>

                            <p className="mt-4 font-dm-serif text-4xl text-emerald-600">
                                {
                                    tasks.filter(
                                        (task) => task.isComplete === "yes"
                                    ).length
                                }
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Successfully completed
                            </p>

                        </div>

                    </div>

                </div>


                {/* Main Content */}
                <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">


                    {/* Task List */}
                    <div className="border border-slate-200 bg-white shadow-sm">

                        <div className="border-b border-slate-100 px-6 py-5">

                            <div className="flex items-center justify-between">

                                <div>

                                    <div className="flex items-center gap-2">

                                        <span className="h-2 w-2 bg-indigo-500"></span>

                                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                                            Overview
                                        </p>

                                    </div>

                                    <h2 className="mt-1 font-dm-serif text-2xl text-slate-900">
                                        Your Tasks
                                    </h2>

                                </div>

                                <span className="bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">
                                    {tasks.length}{" "}
                                    {tasks.length === 1 ? "Task" : "Tasks"}
                                </span>

                            </div>

                        </div>


                        <div className="p-6">

                            {tasks.length === 0 ? (

                                <div className="border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">

                                    <div className="mx-auto flex h-12 w-12 items-center justify-center bg-indigo-50 text-xl text-indigo-500">
                                        +
                                    </div>

                                    <p className="mt-4 font-dm-serif text-xl text-slate-700">
                                        No tasks yet
                                    </p>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Add your first task using the form.
                                    </p>

                                </div>

                            ) : (

                                <div className="space-y-7">


                                    {/* Unfinished Tasks */}
                                    <div>

                                        <div className="mb-3 flex items-center justify-between">

                                            <div className="flex items-center gap-2">

                                                <span className="h-2 w-2 rounded-full bg-amber-500"></span>

                                                <h3 className="text-sm font-bold text-slate-700">
                                                    Unfinished Tasks
                                                </h3>

                                            </div>

                                            <span className="text-xs font-bold text-amber-600">
                                                {
                                                    tasks.filter(
                                                        (task) =>
                                                            task.isComplete ===
                                                            "no"
                                                    ).length
                                                }
                                            </span>

                                        </div>


                                        <div className="space-y-2">

                                            {tasks.filter(
                                                (task) =>
                                                    task.isComplete === "no"
                                            ).length === 0 ? (

                                                <div className="border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center">

                                                    <p className="text-sm text-slate-400">
                                                        No unfinished tasks
                                                    </p>

                                                </div>

                                            ) : (

                                                tasks
                                                    .filter(
                                                        (task) =>
                                                            task.isComplete ===
                                                            "no"
                                                    )
                                                    .map((task) => (

                                                        <div
                                                            key={task._id}
                                                            className="group flex items-center justify-between gap-4 border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-sm"
                                                        >

                                                            <div className="flex min-w-0 items-center gap-3">

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleToggleStatus(
                                                                            task
                                                                        )
                                                                    }
                                                                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 bg-white transition hover:border-indigo-500 hover:bg-indigo-50"
                                                                    aria-label={`Toggle task status for ${task.name}`}
                                                                />

                                                                <div className="min-w-0">

                                                                    <p className="truncate text-sm font-semibold text-slate-800">
                                                                        {task.name}
                                                                    </p>

                                                                    <p className="mt-1 text-xs font-medium text-amber-600">
                                                                        Not Completed
                                                                    </p>

                                                                </div>

                                                            </div>


                                                            <div className="flex shrink-0 gap-2 opacity-80 transition group-hover:opacity-100">

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            task._id
                                                                        )
                                                                    }
                                                                    className="border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-100"
                                                                >
                                                                    Edit
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            task._id
                                                                        )
                                                                    }
                                                                    className="border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100"
                                                                >
                                                                    Delete
                                                                </button>

                                                            </div>

                                                        </div>

                                                    ))

                                            )}

                                        </div>

                                    </div>


                                    {/* Completed Tasks */}
                                    <div>

                                        <div className="mb-3 flex items-center justify-between border-t border-slate-100 pt-6">

                                            <div className="flex items-center gap-2">

                                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>

                                                <h3 className="text-sm font-bold text-slate-700">
                                                    Completed Tasks
                                                </h3>

                                            </div>

                                            <span className="text-xs font-bold text-emerald-600">
                                                {
                                                    tasks.filter(
                                                        (task) =>
                                                            task.isComplete ===
                                                            "yes"
                                                    ).length
                                                }
                                            </span>

                                        </div>


                                        <div className="space-y-2">

                                            {tasks.filter(
                                                (task) =>
                                                    task.isComplete === "yes"
                                            ).length === 0 ? (

                                                <div className="border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center">

                                                    <p className="text-sm text-slate-400">
                                                        No completed tasks yet
                                                    </p>

                                                </div>

                                            ) : (

                                                tasks
                                                    .filter(
                                                        (task) =>
                                                            task.isComplete ===
                                                            "yes"
                                                    )
                                                    .map((task) => (

                                                        <div
                                                            key={task._id}
                                                            className="group flex items-center justify-between gap-4 border border-emerald-100 bg-emerald-50/40 p-4 transition hover:border-emerald-200 hover:bg-emerald-50"
                                                        >

                                                            <div className="flex min-w-0 items-center gap-3">

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleToggleStatus(
                                                                            task
                                                                        )
                                                                    }
                                                                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500 text-white transition hover:bg-emerald-600"
                                                                    aria-label={`Toggle task status for ${task.name}`}
                                                                >
                                                                    <span className="text-xs font-bold">
                                                                        ✓
                                                                    </span>
                                                                </button>

                                                                <div className="min-w-0">

                                                                    <p className="truncate text-sm font-semibold text-slate-400 line-through">
                                                                        {task.name}
                                                                    </p>

                                                                    <p className="mt-1 text-xs font-medium text-emerald-600">
                                                                        Completed
                                                                    </p>

                                                                </div>

                                                            </div>


                                                            <div className="flex shrink-0 gap-2 opacity-80 transition group-hover:opacity-100">

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            task._id
                                                                        )
                                                                    }
                                                                    className="border border-indigo-100 bg-white px-3 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50"
                                                                >
                                                                    Edit
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            task._id
                                                                        )
                                                                    }
                                                                    className="border border-red-100 bg-white px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
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

                            )}

                        </div>

                    </div>


                    {/* Add / Edit Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="border border-slate-200 bg-white shadow-sm"
                    >

                        <div className="border-b border-slate-100 px-6 py-5">

                            <div className="flex items-center gap-2">

                                <span className="h-2 w-2 bg-indigo-500"></span>

                                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                                    {editingId ? "Update" : "Create"}
                                </p>

                            </div>

                            <h2 className="mt-1 font-dm-serif text-2xl text-slate-900">
                                {editingId ? "Edit Task" : "Add New Task"}
                            </h2>

                        </div>


                        <div className="p-6">

                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                                Task Name
                            </label>

                            <input
                                type="text"
                                value={form.name}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        name: event.target.value,
                                    })
                                }
                                placeholder="What needs to be done?"
                                className="w-full border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                            />


                            <label className="mb-2 mt-6 block text-xs font-bold uppercase tracking-wider text-slate-500">
                                Status
                            </label>

                            <select
                                value={form.isComplete}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        isComplete: event.target.value,
                                    })
                                }
                                className="w-full border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                            >
                                <option value="no">Not Completed</option>
                                <option value="yes">Completed</option>
                            </select>


                            <div className="mt-7 flex gap-3">

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
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
                                        className="border border-slate-300 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                )}

                            </div>

                        </div>

                    </form>

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
