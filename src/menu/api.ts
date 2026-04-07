import { BASE_API_URL } from "../common/constants"

export enum Location {
    CowellStevenson = 'Cowell/Stevenson',
    CrownMerrill = 'Crown/Merrill',
    NineTen = 'Nine/Ten',
    PorterKresge = 'Porter/Kresge',
    RachelCarsonOakes = 'Carson/Oakes',
}

export interface FoodGroup {
    [key: string]: FoodItem
}

export interface FoodItem {
    name: string
    restrictions: string[]
    portion?: string
    price?: string
    nutritionUrl?: string
}

export type Meal = Record<string, FoodGroup>

export type Menu = Record<string, Meal>

// export async function getMenu(location: string, day_offset: number = 0): Promise<Menu> {
//     const startTime = new Date();
//     const result = await fetch(`${BASE_API_URL}/menu?location=${location}&day_offset=${day_offset}`).then((response) => {
//         if (!response.ok) {
//             throw new Error('Failed to fetch menu: ' + response.statusText);
//         }
//         return response;
//     }).catch((error) => {
//         console.error('Error fetching menu: ' + error);
//     });

//     if (!result) {
//         return {};
//     }

    
//     const menu: Menu = await result.json();

//     const checkpoint = new Date();
//     let timeDiff = checkpoint.getTime() - startTime.getTime();
//     // console.log('Seconds to get raw menu:', timeDiff / 1000);
//     // const menu: Menu = {}
//     // for (const [mealName, meal] of Object.entries(data)) {
//     //     if (meal && Object.values(meal).length > 0) {
//     //         menu[mealName] = meal;
//     //     } else {
//     //         // console.warn('Empty meal:', mealName + ' for location: ' + location);
//     //     }
//     // }
//     const endTime = new Date();
//     timeDiff = endTime.getTime() - startTime.getTime();
//     console.log('Seconds to fetch menu for location:', location, 'Time:', timeDiff / 1000);
//     return menu;
// }

// export async function getAllLocationMenus(day_offset: number = 0): Promise<Record<string, Menu>> {
//     const startTime = new Date();
//     const locationMenus: Record<string, Menu> = {};
//     for (const location of Object.values(Location)) {
//         const menu = await getMenu(location, day_offset);
//         if (menu && Object.keys(menu).length > 0) {
//             locationMenus[location] = menu;
//         } else {
//             console.warn('Empty menu for location:', location);
//         }
//     }
//     const endTime = new Date();
//     const timeDiff = endTime.getTime() - startTime.getTime();
//     console.log('Seconds to fetch all menus:', timeDiff / 1000);
//     return locationMenus;
// }

export async function getAllLocationMenus(day_offset: number = 0, signal?: AbortSignal): Promise<Record<string, Menu>> {
    const locationMenus: Record<string, Menu> = await fetch(BASE_API_URL + '/menu?dayOffset=' + day_offset, { signal }).then(async (response) => {
        if (!response.ok) {
            throw new Error('Failed to fetch menu: ' + response.statusText);
        }
        return await response.json();
    }).catch(() => {
        // Handle error silently
    });
    if (!locationMenus) {
        return {};
    }
    return locationMenus;
}

// const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 500    // 12 hours
// async function getCachedMenu(dateString: string): Promise<Record<string, Menu> | null> {
//     const cachedMenu = localStorage.getItem('cached_menu_' + dateString);
//     if (!cachedMenu) {
//         return null;
//     }
//     const parsedMenu = JSON.parse(cachedMenu);
//     const currentTime = Date.now();
//     const timeDiff = currentTime - parsedMenu.timestamp;
//     console.log('timeDiff:', timeDiff);
//     if (timeDiff > CACHE_EXPIRATION_TIME) {
//         console.log('Cached menu expired for date:', dateString);
//         localStorage.removeItem('cached_menu_' + dateString);
//         return null;
//     }
//     console.log('Using cached menu for date:', dateString);
//     return parsedMenu.data;
// }

// async function setCachedMenu(dateString: string, menus: Record<string, Menu>) {
//     console.log('Setting cached menu for date:', dateString);
//     localStorage.setItem('cached_menu_' + dateString, JSON.stringify({data: menus, timestamp: Date.now()}));
// }

