
import React, { createContext, useContext } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import InventoryContext from './InventoryContext';
import { validProductions } from '../utils/validators';

const ProductionContext = createContext();

export const ProductionProvider = ({ children }) => {
    const [productions, setProductions] = usePersistentState(
        'stockpro:productions',
        [],
        validProductions
    );

    const { products, recordMovement } = useContext(InventoryContext);

    // Check the material requirements for a production order.
    const checkMaterialAvailability = ({ bom, targetQty }) => {
        const qty = Number(targetQty);

        if (!bom || !Array.isArray(bom.components)) {
            return {
                ok: false,
                error: 'A valid Bill of Materials is required.',
                materials: [],
                canStart: false,
            };
        }

        if (!Number.isInteger(qty) || qty <= 0) {
            return {
                ok: false,
                error: 'Enter a valid target quantity.',
                materials: [],
                canStart: false,
            };
        }

        const materials = bom.components.map((component) => {
            const product = products.find(
                (item) => item.id === component.productId
            );

            const quantityPerUnit = Number(component.quantityPerUnit);
            const requiredQty = quantityPerUnit * qty;
            const availableQty = Number(product?.quantity ?? 0);
            const missingQty = Math.max(0, requiredQty - availableQty);

            return {
                productId: component.productId,
                productName: product?.name || component.productId,
                requiredQty,
                availableQty,
                missingQty,
                sufficient: Boolean(product) && missingQty === 0,
                productFound: Boolean(product),
            };
        });

        const canStart = materials.every(
            (material) => material.sufficient
        );

        return {
            ok: true,
            materials,
            canStart,
            shortageCount: materials.filter(
                (material) => !material.sufficient
            ).length,
        };
    };

    const createProductionOrder = ({ bom, targetQty }) => {
        const qty = Number(targetQty);

        if (!Number.isInteger(qty) || qty <= 0) {
            return {
                ok: false,
                error: 'Enter a valid target quantity.',
            };
        }

        if (!bom || !bom.id || !bom.finishedProductId) {
            return {
                ok: false,
                error: 'Select a valid Bill of Materials.',
            };
        }

        const newOrder = {
            id: `PO-${1000 + productions.length + 1}`,
            bomId: bom.id,
            finishedProductId: bom.finishedProductId,
            finishedProductName: bom.finishedProductName,
            targetQty: qty,
            status: 'Planned',
            createdDate: new Date().toISOString(),
        };

        setProductions([newOrder, ...productions]);

        return { ok: true };
    };

    const startProduction = (orderId, bom) => {
        const order = productions.find(
            (item) => item.id === orderId
        );

        if (!order) {
            return { ok: false, error: 'Order not found.' };
        }

        if (order.status !== 'Planned') {
            return {
                ok: false,
                error: 'Order already started.',
            };
        }

        const availability = checkMaterialAvailability({
            bom,
            targetQty: order.targetQty,
        });

        if (!availability.ok) {
            return {
                ok: false,
                error: availability.error,
            };
        }

        if (!availability.canStart) {
            const shortages = availability.materials
                .filter((material) => !material.sufficient)
                .map((material) => {
                    if (!material.productFound) {
                        return `${material.productName} was not found in inventory`;
                    }

                    return `${material.productName}: missing ${material.missingQty}`;
                });

            return {
                ok: false,
                error: `Insufficient materials: ${shortages.join('; ')}.`,
                materials: availability.materials,
            };
        }

        // Deduct components only after all material checks pass.
        for (const material of availability.materials) {
            const result = recordMovement({
                productId: material.productId,
                type: 'OUT',
                quantity: material.requiredQty,
                reason: `Used for Production Order ${order.id}`,
            });

            if (!result.ok) {
                return {
                    ok: false,
                    error: result.error,
                };
            }
        }

        setProductions(
            productions.map((item) =>
                item.id === orderId
                    ? {
                        ...item,
                        status: 'In Progress',
                        startedDate: new Date().toISOString(),
                    }
                    : item
            )
        );

        return { ok: true };
    };

    const completeProduction = (orderId) => {
        const order = productions.find(
            (item) => item.id === orderId
        );

        if (!order) {
            return { ok: false, error: 'Order not found.' };
        }

        if (order.status !== 'In Progress') {
            return {
                ok: false,
                error: 'Order is not in progress.',
            };
        }

        const result = recordMovement({
            productId: order.finishedProductId,
            type: 'IN',
            quantity: order.targetQty,
            reason: `Production Order ${order.id} completed`,
        });

        if (!result.ok) {
            return { ok: false, error: result.error };
        }

        setProductions(
            productions.map((item) =>
                item.id === orderId
                    ? {
                        ...item,
                        status: 'Completed',
                        completedDate: new Date().toISOString(),
                    }
                    : item
            )
        );

        return { ok: true };
    };

    return (
        <ProductionContext.Provider
            value={{
                productions,
                createProductionOrder,
                startProduction,
                completeProduction,
                checkMaterialAvailability,
            }}
        >
            {children}
        </ProductionContext.Provider>
    );
};

export default ProductionContext;
