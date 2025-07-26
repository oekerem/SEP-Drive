
export const routeKey = (id) => `drive-route-${id}`;

export const saveRouteSnapshot = (id, route) => {
    localStorage.setItem(routeKey(id), JSON.stringify(route));
};

export const getSavedRouteSnapshot = (id) => {
    const val = localStorage.getItem(routeKey(id));
    return val ? JSON.parse(val) : null;
};

export const clearRouteSnapshot = (id) => {
    localStorage.removeItem(routeKey(id));
};

export const routesEqual = (r1, r2) => {
    if (!r1 || !r2 || r1.length !== r2.length) return false;
    return r1.every((p, i) => p.lat === r2[i].lat && p.lng === r2[i].lng);
};
