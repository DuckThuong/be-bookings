import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CLIENT_BOOKING_CATALOG,
  CLIENT_BOOKING_META,
  ClientCatalogAddon,
  ClientCatalogPromo,
} from '../../assets/config/client-booking.config';
import { ClientErrorMessage } from '../../assets/messages/client.message';
import { AddonLineDto } from '../../dtos/CLIENT/bookings.dto';

export interface ClientPricingResult {
  subTotal: number;
  addonsTotal: number;
  fee: number;
  promoCode: string | null;
  promoDiscount: number;
  total: number;
}

@Injectable()
export class ClientBookingPricingService {
  calcAddonsTotal(addons: AddonLineDto[] = []): number {
    let total = 0;
    for (const line of addons) {
      const catalog = this.getAddon(line.id);
      const qty = catalog.hasQty ? (line.qty ?? 0) : 1;
      if (catalog.hasQty) {
        const min = catalog.qtyMin ?? 0;
        const max = catalog.qtyMax ?? 99;
        if (qty < min || qty > max) {
          throw new HttpException(
            ClientErrorMessage.ADDON_QTY_INVALID,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      total += catalog.price * qty;
    }
    return total;
  }

  calcPricing(params: {
    seatCount: number;
    unitPrice: number;
    addons?: AddonLineDto[];
    promoCode?: string | null;
  }): ClientPricingResult {
    const subTotal = params.seatCount * params.unitPrice;
    const addonsTotal = this.calcAddonsTotal(params.addons ?? []);
    const fee = Math.round(subTotal * CLIENT_BOOKING_META.feeRate);
    const promoCode = params.promoCode?.trim() || null;
    const promoDiscount = promoCode
      ? this.calcPromoDiscount(promoCode, subTotal, addonsTotal)
      : 0;
    const total = Math.max(0, subTotal + fee + addonsTotal - promoDiscount);

    return {
      subTotal,
      addonsTotal,
      fee,
      promoCode,
      promoDiscount,
      total,
    };
  }

  validatePromo(
    promoCode: string,
    subTotal: number,
    addonsTotal: number,
  ): {
    valid: boolean;
    promoCode: string;
    promoDiscount: number;
    type?: 'fixed' | 'percent';
    value?: number;
    message?: string;
  } {
    const normalizedCode = promoCode.trim();
    try {
      const promo = this.getPromo(normalizedCode);
      const promoDiscount = this.calcPromoDiscount(
        normalizedCode,
        subTotal,
        addonsTotal,
      );
      return {
        valid: true,
        promoCode: promo.code,
        promoDiscount,
        type: promo.type,
        value: promo.value,
      };
    } catch (e) {
      const message =
        e instanceof HttpException
          ? (e.getResponse() as string)
          : ClientErrorMessage.PROMO_INVALID;
      return {
        valid: false,
        promoCode: normalizedCode,
        promoDiscount: 0,
        message,
      };
    }
  }

  calcPromoDiscount(
    promoCode: string,
    subTotal: number,
    addonsTotal: number,
  ): number {
    const promo = this.getPromo(promoCode);
    const orderBase = subTotal + addonsTotal;
    if (promo.minOrder !== undefined && orderBase < promo.minOrder) {
      throw new HttpException(
        ClientErrorMessage.PROMO_MIN_ORDER,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (promo.type === 'fixed') {
      return promo.value;
    }
    const raw = Math.round(orderBase * promo.value);
    return promo.max !== undefined ? Math.min(raw, promo.max) : raw;
  }

  normalizeAddons(addons: AddonLineDto[] = []): AddonLineDto[] {
    return addons.map((line) => {
      const catalog = this.getAddon(line.id);
      const qty = catalog.hasQty ? (line.qty ?? 0) : 1;
      return {
        id: catalog.id,
        name: catalog.name,
        price: catalog.price,
        ...(catalog.hasQty ? { qty } : {}),
      };
    });
  }

  normalizeAddonsFromFe(
    addons: { id: string; quantity?: number }[] = [],
  ): AddonLineDto[] {
    return addons.map((line) => {
      const catalog = this.getAddon(line.id);
      const qty = catalog.hasQty ? (line.quantity ?? 0) : 1;
      return {
        id: catalog.id,
        name: catalog.name,
        price: catalog.price,
        ...(catalog.hasQty ? { qty } : {}),
      };
    });
  }

  private getAddon(id: string): ClientCatalogAddon {
    const found = CLIENT_BOOKING_CATALOG.addonServices.find((a) => a.id === id);
    if (!found) {
      throw new HttpException(
        ClientErrorMessage.ADDON_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }
    return found;
  }

  private getPromo(code: string): ClientCatalogPromo {
    const found = CLIENT_BOOKING_CATALOG.promoCodes.find(
      (p) => p.code.toUpperCase() === code.trim().toUpperCase(),
    );
    if (!found) {
      throw new HttpException(
        ClientErrorMessage.PROMO_INVALID,
        HttpStatus.BAD_REQUEST,
      );
    }
    return found;
  }
}
