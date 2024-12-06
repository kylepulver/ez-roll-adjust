export class ChatAdjustApplication extends Application {
    constructor(message) {
        super();
        this.message = message;
        this.flavors = this.message.rolls[0].terms.filter(term => term.flavor).map(term => term.flavor);
        if (!this.flavors.length) {
            this.flavors = ["adjust", "heroic"]
        }
    }
    
    static get defaultOptions() {
        const defaults = super.defaultOptions;

        const overrides = {
            height: 'auto',
            id: 'roll-adjust',
            template: 'modules/ez-roll-adjust/template.hbs',
            title: "Adjust Roll",
            width: 300,
            classes: ["ez-roll-adjust"]
        };

        return foundry.utils.mergeObject(defaults, overrides);
    }

    getData(options) {
        return {message: this.message, flavors: this.flavors};
    }

    activateListeners(html) {
        super.activateListeners(html);

        const setTerm = (roll, number, flavor = "adjust") => {
            let term = roll.terms.find(t => t.flavor == flavor) ?? false;

            if (!term) {
                term = new foundry.dice.terms.NumericTerm({number: 0, options:{flavor: flavor}});
                roll.terms.push(new foundry.dice.terms.OperatorTerm({operator:"+"}))
                roll.terms.push(term);
            }

            term.number = number;

            if (term.number == 0) {
                const idx = roll.terms.findIndex(t => t == term);
                roll.terms.splice(idx - 1, 2);
            }

            roll._total = roll._evaluateTotal();
            roll._formula = roll.formula;
        }

        const addTerm = (roll, add, flavor = "adjust") => {
            let term = roll.terms.find(t => t.flavor == flavor) ?? false;

            if (!term) {
                term = new foundry.dice.terms.NumericTerm({number: 0, options:{flavor: flavor}});
                roll.terms.push(new foundry.dice.terms.OperatorTerm({operator:"+"}))
                roll.terms.push(term);
            }

            term.number += add;

            if (term.number == 0) {
                const idx = roll.terms.findIndex(t => t == term);
                roll.terms.splice(idx - 1, 2);
            }

            roll._total = roll._evaluateTotal();
            roll._formula = roll.formula;
        }
        
        html.on("click", "[data-action]", async (ev) => {
            const action = ev.currentTarget.dataset.action
            const flavor = $(ev.currentTarget).closest("[data-flavor]").data("flavor");
            
            // Assume there's just one roll here
            const roll = this.message.rolls[0];

            if (action == "new") {
                const newname = html.find(`input[name="newname"]`).val();

                if (!newname) return;
                if (this.flavors.includes(newname)) return;

                this.flavors.push(newname);
                this.render(true);

                return;
            }

            if (action == "inc") {
                addTerm(roll, 1, flavor)
            }
            if (action == "dec") {
                addTerm(roll, -1, flavor)
            }

            
            
            // Force update for rerolls that are a pain in the butt
            const content = $(`<div>` + this.message.content + `</div>`);
            content.find(".dice-result .dice-formula").not('.reroll-discard .dice-formula').text(roll.formula)
            content.find(".dice-result .dice-total").not('.reroll-discard .dice-total').text(roll._total)
            
            await this.message.update({
                rolls: foundry.utils.duplicate(this.message.rolls),
                content: content.html()
            })

            this.render(true);
        })
    }
}