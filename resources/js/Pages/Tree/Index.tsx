import AddPersonModal from '@/Components/Person/AddPersonModal';
import FemaleNode from '@/Components/Tree/FemaleNode';
import PersonNode from '@/Components/Tree/PersonNode';
import TreeControls from '@/Components/Tree/TreeControls';
import {
    NunLogo,
    PlusIcon,
    SearchIcon,
    ShieldCheckIcon,
    TreeNodesIcon,
} from '@/Components/UI/Icons';
import ThemeToggle from '@/Components/UI/ThemeToggle';
import { useTreeExpansion } from '@/hooks/useTreeExpansion';
import type { PageProps, PersonNodeData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Background,
    BackgroundVariant,
    type Edge,
    type Node,
    type NodeMouseHandler,
    ReactFlow,
    ReactFlowProvider,
    useReactFlow,
} from '@xyflow/react';
import { useCallback, useMemo, useState } from 'react';

type PersonNode = Node<PersonNodeData>;

interface InitialTree {
    nodes: PersonNode[];
    edges: Edge[];
    root_person_id: number | null;
}

type TreePageProps = PageProps<{ initialTree: InitialTree }>;

function TreeCanvas({
    initialTree,
    tribeSlug,
    canModerate,
    canEdit,
    pendingCount,
}: {
    readonly initialTree: InitialTree;
    readonly tribeSlug: string;
    readonly canModerate: boolean;
    readonly canEdit: boolean;
    readonly pendingCount: number;
}) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [isFullyExpanded, setIsFullyExpanded] = useState(false);
    const [expandLoading, setExpandLoading] = useState(false);
    const { fitView, setCenter } = useReactFlow();

    const { nodes, edges, expand, replaceTree } = useTreeExpansion(
        initialTree.nodes,
        initialTree.edges,
    );

    const nodeTypes = useMemo(
        () => ({ personNode: PersonNode, femaleNode: FemaleNode }),
        [],
    );

    /**
     * عند النقر على Node:
     *  - لو النقر على زر التوسيع → expand/collapse
     *  - غير ذلك: لا شيء (في المرحلة القادمة: يفتح ملف الشخص)
     */
    const handleNodeClick: NodeMouseHandler = useCallback(
        (event, node) => {
            const target = event.target as HTMLElement;
            const isExpandBtn = target.closest('[data-expand-btn="true"]');
            const personId = (node.data as PersonNodeData).id;
            const tribeSlug = globalThis.location.pathname.split('/')[2];

            if (isExpandBtn) {
                expand(personId, `/tribes/${tribeSlug}/tree/expand/${personId}`);
            } else {
                router.visit(`/tribes/${tribeSlug}/persons/${personId}`);
            }
        },
        [expand],
    );

    const handleHome = useCallback(() => {
        if (!initialTree.root_person_id) return;
        const root = nodes.find((n) => n.data.id === initialTree.root_person_id);
        if (root) {
            setCenter(root.position.x + 100, root.position.y + 65, {
                zoom: 1,
                duration: 500,
            });
        } else {
            fitView({ duration: 400, padding: 0.2 });
        }
    }, [nodes, initialTree.root_person_id, fitView, setCenter]);

    /**
     * فتح الشجرة كاملة أو طيّها للحالة الأصلية.
     * الحالة لا تُحفَظ — عند الخروج من الصفحة تعود الشجرة لوضعها الأصلي.
     */
    const handleToggleExpandAll = useCallback(async () => {
        if (expandLoading) return;

        if (isFullyExpanded) {
            // طي → الحالة الأصلية
            replaceTree(initialTree.nodes, initialTree.edges);
            setIsFullyExpanded(false);
            setTimeout(() => fitView({ duration: 400, padding: 0.2 }), 50);
            return;
        }

        // فتح كاملة
        setExpandLoading(true);
        try {
            const res = await fetch(`/tribes/${tribeSlug}/tree/full`, {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const full = await res.json();
            replaceTree(full.nodes, full.edges);
            setIsFullyExpanded(true);
            setTimeout(() => fitView({ duration: 400, padding: 0.2 }), 50);
        } catch (err) {
            console.error('Full tree fetch failed:', err);
        } finally {
            setExpandLoading(false);
        }
    }, [
        expandLoading,
        isFullyExpanded,
        replaceTree,
        initialTree.nodes,
        initialTree.edges,
        tribeSlug,
        fitView,
    ]);

    return (
        <div
            className="tree-bg w-full h-screen relative"
            // React Flow يعمل LTR داخلياً
            dir="ltr"
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodeClick={handleNodeClick}
                fitView
                fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
                minZoom={0.2}
                maxZoom={2}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable
                proOptions={{ hideAttribution: true }}
                defaultEdgeOptions={{
                    type: 'smoothstep',
                    style: { stroke: '#C9A84C', strokeWidth: 2 },
                    animated: false,
                }}
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={24}
                    size={1.5}
                    color="#C9A84C"
                    style={{ opacity: 0.15 }}
                />
            </ReactFlow>

            {/* حالة الشجرة الفارغة — CTA لإنشاء أول شخص */}
            {nodes.length === 0 && (
                <div
                    className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none"
                    dir="rtl"
                >
                    <div className="pointer-events-auto text-center bg-white/90 dark:bg-night-card/90 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-gold/30 shadow-2xl max-w-md">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gold-soft/50 border border-gold/20 text-gold flex items-center justify-center mb-4">
                            <TreeNodesIcon className="w-8 h-8" />
                        </div>
                        <h2 className="font-amiri text-2xl font-bold text-brown-dark mb-2">
                            الشجرة فارغة
                        </h2>
                        <p className="text-brown-mid text-sm mb-6 leading-relaxed">
                            {canEdit
                                ? 'لم تُضَف أي شخصية بعد. ابدأ بإنشاء الجدّ الأكبر للقبيلة — وسيُصبح هو جذر الشجرة تلقائياً.'
                                : 'لم تُضَف أي شخصية بعد لهذه القبيلة.'}
                        </p>
                        {canEdit && (
                            <button
                                type="button"
                                onClick={() => setShowAddModal(true)}
                                className="ns-btn inline-flex items-center gap-2 px-6 py-3 bg-gold text-white rounded-xl font-bold shadow-[0_8px_22px_rgba(139,105,20,0.28)] hover:bg-[#79540f]"
                            >
                                <PlusIcon className="relative z-10 w-5 h-5" />
                                <span className="relative z-10">إضافة الجدّ الأكبر</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* زر إضافة شخص (عائم) — للمشرفين في شجرة غير فارغة */}
            {canEdit && nodes.length > 0 && (
                <div className="absolute bottom-4 left-20 z-10" dir="rtl">
                    <button
                        type="button"
                        onClick={() => setShowAddModal(true)}
                        className="ns-btn inline-flex items-center gap-2 px-4 py-2.5 bg-gold text-white rounded-xl shadow-md hover:bg-[#79540f] font-medium text-sm"
                        title="إضافة شخص جديد"
                    >
                        <PlusIcon className="relative z-10 w-4 h-4" />
                        <span className="relative z-10">إضافة شخص</span>
                    </button>
                </div>
            )}

            {/* Modal إضافة شخص (بدون والد معروف → جذر أو شخص بلا والدَين) */}
            {canEdit && (
                <AddPersonModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    tribeSlug={tribeSlug}
                />
            )}

            <TreeControls
                onHome={handleHome}
                onToggleExpandAll={handleToggleExpandAll}
                isFullyExpanded={isFullyExpanded}
                expandLoading={expandLoading}
            />

            {/* ThemeToggle — فوق اليسار بجوار الـ controls */}
            <div className="absolute bottom-4 left-4 z-10" dir="rtl">
                <ThemeToggle />
            </div>

            {/* العنوان + زر العودة للوحة التحكم */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2" dir="rtl">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 bg-white/80 dark:bg-night-card/80 backdrop-blur-md rounded-2xl px-4 py-3 border border-gold/20 shadow-md hover:shadow-lg text-brown-dark font-medium text-sm transition-all group"
                    title="العودة للوحة التحكم"
                >
                    <svg
                        className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                    <span className="hidden sm:inline">لوحة التحكم</span>
                </Link>

                <div className="bg-white/80 dark:bg-night-card/80 backdrop-blur-md rounded-2xl px-5 py-3 border border-gold/20 shadow-md flex items-center gap-3">
                    <NunLogo className="w-9 h-9 text-[20px]" />
                    <div>
                        <div className="font-amiri text-brown-dark font-bold">نَسَب</div>
                        <div className="text-brown-light text-xs">
                            {nodes.length} شخص / {edges.length} علاقة
                        </div>
                    </div>
                </div>
            </div>

            {/* روابط جانبية: البحث + طلبات الموافقة (للمشرفين) */}
            <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2" dir="rtl">
                <Link
                    href={`/tribes/${tribeSlug}/search`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/90 dark:bg-night-card/90 backdrop-blur-md rounded-xl border border-gold/20 shadow-md hover:shadow-lg text-brown-dark font-medium text-sm transition-all"
                >
                    <SearchIcon className="w-4 h-4 text-gold" />
                    <span>البحث وصلة القرابة</span>
                </Link>

                {canModerate && (
                    <Link
                        href={`/tribes/${tribeSlug}/admin/pending-edits`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/90 dark:bg-night-card/90 backdrop-blur-md rounded-xl border border-gold/20 shadow-md hover:shadow-lg text-brown-dark font-medium text-sm transition-all relative"
                    >
                        <ShieldCheckIcon className="w-4 h-4 text-gold" />
                        <span>طلبات الموافقة</span>
                        {pendingCount > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-rose-500 text-white text-xs font-bold">
                                {pendingCount}
                            </span>
                        )}
                    </Link>
                )}
            </div>
        </div>
    );
}

export default function TreeIndex({ initialTree, tribe, auth, pending_count }: TreePageProps) {
    const canEdit = auth.user?.can_edit ?? false;
    const tribeSlug = tribe?.slug ?? '';
    const canModerate = auth.user?.can_moderate ?? false;

    return (
        <>
            <Head title={`شجرة النسب${tribe ? ` — ${tribe.name_ar}` : ''}`} />
            <ReactFlowProvider>
                <TreeCanvas
                    initialTree={initialTree}
                    tribeSlug={tribeSlug}
                    canModerate={canModerate}
                    canEdit={canEdit}
                    pendingCount={pending_count}
                />
            </ReactFlowProvider>
        </>
    );
}
